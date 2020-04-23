/* 获取XML节点信息；参数值用XML转义即可，CDATA标签用于说明数据不被XML解析器解析。
<xml><appid><![CDATA[wx]]></appid>
<bank_type><![CDATA[BOB_CREDIT]]></bank_type>
<cash_fee><![CDATA[999]]></cash_fee>
<fee_type><![CDATA[CNY]]></fee_type>
<is_subscribe><![CDATA[N]]></is_subscribe>
<mch_id><![CDATA[00]]></mch_id>
<nonce_str><![CDATA[k0fba3uizw0nabhbgn]]></nonce_str>
<openid><![CDATA[00]]></openid>
<out_trade_no><![CDATA[00]]></out_trade_no>
<result_code><![CDATA[SUCCESS]]></result_code>
<return_code><![CDATA[SUCCESS]]></return_code>
<sign><![CDATA[00]]></sign>
<time_end><![CDATA[00]]></time_end>
<total_fee>999</total_fee>
<trade_type><![CDATA[JSAPI]]></trade_type>
<transaction_id><![CDATA[00]]></transaction_id>
</xml>
*/
function getXMLNodeValue(nodeName, xml) {
    const regex = new RegExp(`<${nodeName}><\\!\\[CDATA\\[(.*?)\\]\\]><\/${nodeName}>`, 'i')
    let arr = xml.match(regex)
    if (!arr) {
        const regexSimple = new RegExp(`<${nodeName}>(.*?)<\/${nodeName}>`, 'i')
        arr = xml.match(regexSimple)
    }
    if (!arr) {
        console.log(xml)
    }
    return arr[1]
}

// 获取所有节点 name
function getAllXMLNode(xml) {
    return xml
        .replace('</xml>', '')
        .match(/<\/(.*?)>/g)
        .map(el => el.slice(2, -1))
}
function getAllXMLNodeValue(xml) {
    return getAllXMLNode(xml).reduce((total, nodeName) => {
        total[nodeName] = getXMLNodeValue(nodeName, xml)
        return total
    }, {})
}

module.exports = {
    getXMLNodeValue,
    getAllXMLNodeValue,
}
