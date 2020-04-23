// https://help.aliyun.com/document_detail/56354.html

// 表格存储数据模型和查询操作
// https://yq.aliyun.com/articles/38621

const TableStore = require('tablestore')
// const Long = TableStore.Long
const { accessKeyId, accessKeySecret, region, instanceName } = require('../constants/aliyun')

const chunk = require('lodash/chunk')
const concat = require('lodash/concat')

const OTS_CLIENT = {
    accessKeyId,
    accessKeySecret,
    endpoint: `https://${instanceName}.${region}.ots.aliyuncs.com`,
    instancename: instanceName,
}
const client = new TableStore.Client(OTS_CLIENT)

/**
 * 单行操作
 */

// 读取一行数据（GetRow）
function getRow({ tableName, primaryKey, columnsToGet = [] }) {
    return new Promise((resolve, reject) => {
        const params = {
            tableName,
            primaryKey,
            columnsToGet,
            maxVersions: 1, //最多可读取的版本数，设置为2即代表最多可读取2个版本。
        }

        client.getRow(params, function(err, data) {
            if (err) {
                console.log('getRow error')
                reject(err)
            } else {
                const item = fmtRow(data.row)
                resolve(item)
            }
        })
    })
}

// 插入一行数据（PutRow）
function putRow({ tableName, primaryKey, columns }) {
    return new Promise((resolve, reject) => {
        // RowExistenceExpectation.IGNORE 表示不管此行是否已经存在，都会插入新数据，如果之前有会被覆盖。
        // RowExistenceExpectation.EXPECT_EXIST 表示只有此行存在时，才会插入新数据，此时，原有数据也会被覆盖。
        // RowExistenceExpectation.EXPECT_NOT_EXIST 表示只有此行不存在时，才会插入数据，否则不执行。
        const params = {
            tableName,
            condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
            primaryKey: primaryKey,
            attributeColumns: columns,
            returnContent: { returnType: TableStore.ReturnType.Primarykey },
        }
        client.putRow(params, function(err, data) {
            if (err) {
                console.log('putRow error')
                reject(err)
            } else {
                const item = fmtRow(data.row)
                resolve(item)
            }
        })
    })
}

// 更新一行数据（UpdateRow）
function updateRow({ tableName, primaryKey, columns }) {
    return new Promise((resolve, reject) => {
        var params = {
            tableName,
            condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
            primaryKey: primaryKey,
            updateOfAttributeColumns: columns,
        }
        client.updateRow(params, function(err, data) {
            if (err) {
                console.log('updateRow error')
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

// 删除一行数据（DeleteRow）
function deleteRow({ tableName, primaryKey }) {
    return new Promise((resolve, reject) => {
        var params = {
            tableName,
            condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
            primaryKey,
        }
        client.deleteRow(params, function(err, data) {
            if (err) {
                console.log('deleteRow error')
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

/**
 * 多行数据操作
 */

// 批量读（BatchGetRow）
// BatchGetRow 一次操作请求读取的行数限制值 100
async function batchGetRow({ tableName, primaryKey, columnsToGet = [], columnFilter }, clientInstance = client) {
    const arr = chunk(primaryKey, 100)
    const fnList = arr.map(sub => async () =>
        await handleBatchGetRow({ tableName, primaryKey: sub, columnsToGet, columnFilter }, clientInstance)
    )
    const out = await Promise.all(fnList.map(fn => fn()))
    return concat.apply(null, out)
}

function handleBatchGetRow({ tableName, primaryKey, columnsToGet = [], columnFilter }, clientInstance) {
    return new Promise((resolve, reject) => {
        const params = {
            tables: [
                {
                    tableName,
                    primaryKey, //[[{}],[{}]]
                    columnsToGet,
                    columnFilter,
                },
            ],
        }
        clientInstance.batchGetRow(params, function(err, data) {
            if (err) {
                console.log('batchGetRow error')
                reject(err)
            } else {
                const rows = data.tables[0]
                const list = fmtRows(rows)
                resolve(list)
            }
        })
    })
}

// 批量写（BatchWriteRow）
// BatchWriteRow 操作可视为多个 PutRow、UpdateRow、DeleteRow 操作的集合，各个操作独立执行，独立返回结果，独立计算服务能力单元。
// BatchWriteRow 一次操作请求写入行数     200
// BatchWriteRow 一次操作的数据大小 	4 MB
async function batchWriteRow({ tableName, rows }) {
    const arr = chunk(rows, 100)
    const fnList = arr.map(sub => async () => await handleBatchWriteRow([{ tableName, rows: sub }]))
    const out = await Promise.all(fnList.map(fn => fn()))
    return concat.apply(null, out)
}

async function handleBatchWriteRow(tables) {
    const rowParams = {
        condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
        // primaryKey: [{ gid: Long.fromNumber(8) }, { uid: Long.fromNumber(80) }],
        // attributeColumns: [{ attrCol1: 'test1' }, { attrCol2: 'test2' }],
        returnContent: { returnType: TableStore.ReturnType.Primarykey },
    }
    for (let i = 0; i < tables.length; i++) {
        tables[i].rows = tables[i].rows.map(row => Object.assign({}, rowParams, row))
    }

    // tables: [{ tableName, rows }]
    const data = await client.batchWriteRow({ tables })
    return fmtRows(data.tables)
}

// 范围读（GetRange）
// 读取指定主键范围内的数据。
// 一次返回数据的行数超过 5000 行，或者返回数据的数据大小大于 4 MB。满足以上任一条件时，超出上限的数据将会按行级别被截掉并返回下一行数据主键信息。
async function getRange({
    tableName,
    inclusiveStartPrimaryKey,
    exclusiveEndPrimaryKey,
    columnsToGet = [],
    direction = TableStore.Direction.FORWARD, //BACKWARD
    columnFilter,
    limit, //一次读取数目
}, clientInstance = client) {
    const params = {
        tableName,
        direction,
        inclusiveStartPrimaryKey,
        exclusiveEndPrimaryKey,
        // limit: 5000, //max-limit，不一定每次都获取最大值5000，可能获取2623，需要再继续获取
        columnsToGet,
    }

    if (columnFilter) {
        params.columnFilter = columnFilter
    }

    if (limit) {
        params.limit = limit
    }

    let rows = []
    const handle = async params => {
        const data = await clientInstance.getRange(params)
        rows = [...rows, ...data.rows]
        // console.log(rows.length)

        // limit 一次读取数目 并返回
        if (limit && rows.length >= limit) {
            return rows
        }

        //如果data.next_start_primary_key不为空，说明需要继续读取
        if (data.next_start_primary_key) {
            params.inclusiveStartPrimaryKey = data.next_start_primary_key.map(item => ({ [item.name]: item.value }))
            return await handle(params)
        } else {
            return rows
        }
    }
    const allRows = await handle(params)
    return fmtRows(allRows)
}

/**
 * 多元索引查询
 * https://help.aliyun.com/document_detail/100621.html
 */

async function search({ tableName, indexName, query, returnType = 'RETURN_ALL' }) {
    const params = {
        tableName,
        indexName,
        searchQuery: {
            offset: 0,
            limit: 100, //如果只为了取行数，但不需要具体数据，可以设置limit=0，即不返回任意一行数据。
            token: null,
            query,
            getTotalCount: true, // 结果中的TotalCount可以表示表中数据的总行数， 默认false不返回
        },
        columnToGet: {
            //返回列设置：RETURN_SPECIFIED(自定义),RETURN_ALL(所有列),RETURN_NONE(不返回)
            returnType: TableStore.ColumnReturnType[returnType],
        },
    }

    let rows = []
    const handle = async params => {
        // ⚠ 多元搜索一次最多只能索引100条数据，需迭代索引
        const data = await client.search(params)
        // console.log(data.totalCounts)
        // console.log(data.rows.length)

        rows = [...rows, ...data.rows]

        if (data.nextToken) {
            params.searchQuery.token = data.nextToken // 翻页更新token值
            return await handle(params)
        } else {
            return rows
        }
    }
    const allRows = await handle(params)
    return fmtRows(allRows)
}

/**
 * format
 */
function fmtRow(row) {
    if (row.primaryKey) {
        const obj = row.primaryKey.reduce((total, item) => {
            total[item.name] = item.value
            return total
        }, {})
        return row.attributes.reduce((total, item) => {
            total[item.columnName] = item.columnValue
            return total
        }, obj)
    } else {
        console.log(row)
        return null
    }
}
function fmtRows(rows) {
    return rows.map(fmtRow).filter(el => el)
}

module.exports = {
    client,

    // 单行数据操作
    getRow,
    putRow,
    updateRow,
    deleteRow,

    // 批量读
    batchGetRow,

    // 批量写
    batchWriteRow,

    // 范围读
    getRange,

    search,
}
