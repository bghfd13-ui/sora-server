import { v4 as uuidv4 } from "uuid";
export const SOAP = (baseUrl, jobExpiration, finalScript) => {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://silrev.biz/">
   <soapenv:Header/>
   <soapenv:Body>
      <ns1:BatchJob>
         <ns1:job>
            <ns1:id>${uuidv4().toString()}</ns1:id>
            <ns1:expirationInSeconds>${jobExpiration}</ns1:expirationInSeconds>
            <ns1:cores>1</ns1:cores>
         </ns1:job>
         <ns1:script>
            <ns1:name>${uuidv4().toString()}</ns1:name>
            <ns1:script><![CDATA[
${finalScript}
            ]]></ns1:script>
         </ns1:script>
      </ns1:BatchJob>
   </soapenv:Body>
</soapenv:Envelope>
`;
};
