import { RCCRequest } from "../Utilities/Libraries/Request.js";
import xml2js from "xml2js";
import { Console } from "../Utilities/Libraries/CS.js";
import Resp from "../Utilities/Libraries/Resp.js";
export const RequestRCCBase = async (req, res, xml, port, type, envelopeType) => {
    const request = req.body;
    const response = await RCCRequest(port, xml, request.jobExpiration);
    try {
        const normalizedResponse = NormalizeRccResponse(response);
        let result = (await xml2js.parseStringPromise(normalizedResponse, { explicitArray: false }))["SOAP-ENV:Envelope"];
        result = CleanXmlJson(result);
        let xmlData = result?.Body?.BatchJobResponse?.BatchJobResult?.value;
        if (!xmlData) {
            result = result;
            xmlData = result?.Body?.BatchJobResponse?.BatchJobResult?.[0]?.value;
        }
        if (!xmlData) {
            throw new Error("RCC returned a valid response but no BatchJobResult.value was found.");
        }
        Console.Log(`&aRendered &lsuccessfully&r&a on port &l${port}&r with UserId &l${request.userId}&r, &lAssetId ${request.assetId}&r.`);
        return Resp(res, 200, "success", true, { data: xmlData });
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message.startsWith("Non-whitespace before first tag.")) {
            Console.Error(`${type} render with &c&lUserId ${request.userId}&r, &c&lAssetId ${request.assetId}&r on &c&lport ${port}&r failed because RCC did not return XML. Response preview: ${ResponsePreview(response)}`);
        }
        else {
            Console.Error(`${type} render with &c&lUserId ${request.userId}&r, &c&lAssetId ${request.assetId}&r on &c&lport ${port}&r failed with the following error message: ${message}`);
        }
        return Resp(res, 500, message);
    }
};
export const RequestRCCBaseXMLData = async (req, res, xml, port, type, envelopeType) => {
    const request = req.body;
    const response = await RCCRequest(port, xml, request.jobExpiration);
    try {
        const normalizedResponse = NormalizeRccResponse(response);
        let result = (await xml2js.parseStringPromise(normalizedResponse, { explicitArray: false }))["SOAP-ENV:Envelope"];
        let xmlData;
        switch (envelopeType) {
            case 2:
                result = CleanXmlJson(result);
                xmlData = result.Body.BatchJobResponse.BatchJobResult.value;
                break;
            default:
                result = result;
                xmlData = result.Body.BatchJobResponse.BatchJobResult[0].value;
                break;
        }
        Console.Log(`&aRendered &lsuccessfully&r&a on port &l${port}&r with ${request.userId}&r, &c&lAssetId ${request.assetId}&r.`);
        return xmlData;
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message.startsWith("Non-whitespace before first tag.")) {
            Console.Error(`${type} render with &c&lUserId ${request.userId}&r, &c&lAssetId ${request.assetId}&r on &c&lport ${port}&r failed because RCC did not return XML. Response preview: ${ResponsePreview(response)}`);
        }
        else {
            Console.Error(`${type} render with ${request.userId}&r, &c&lAssetId ${request.assetId}&r on &c&lport ${port}&r failed with the following error message: ${message}`);
        }
        return Resp(res, 500, message);
    }
};
function NormalizeRccResponse(response) {
    if (typeof response !== "string") {
        throw new Error(`RCC returned a non-string response of type ${typeof response}.`);
    }
    let value = response.trim();
    if (!value) {
        throw new Error("RCC returned an empty response.");
    }
    for (let i = 0; i < 2; i++) {
        if (!(value.startsWith("[") || value.startsWith("{")))
            break;
        let parsed;
        try {
            parsed = JSON.parse(value);
        }
        catch (_) {
            break;
        }
        if (typeof parsed === "string") {
            value = parsed.trim();
            continue;
        }
        if (Array.isArray(parsed)) {
            const stringValue = parsed.find((item) => typeof item === "string" && item.trim().length > 0);
            if (stringValue != null) {
                value = stringValue.trim();
                continue;
            }
        }
        if (parsed && typeof parsed === "object") {
            const candidate = parsed.value ?? parsed.data ?? parsed.response ?? parsed.body;
            if (typeof candidate === "string") {
                value = candidate.trim();
                continue;
            }
        }
        break;
    }
    return value;
}
function ResponsePreview(response) {
    if (typeof response !== "string")
        return JSON.stringify(response)?.slice(0, 500) ?? String(response);
    return response.replace(/\s+/g, " ").slice(0, 500);
}
export class BaseJson {
    Mode;
    Settings;
    Arguments;
}
function CleanXmlJson(obj) {
    if (Array.isArray(obj)) {
        return obj.map(CleanXmlJson);
    }
    else if (typeof obj === "object" && obj !== null) {
        const newObj = {};
        for (const key in obj) {
            if (key === "$")
                continue;
            const cleanedKey = key.includes(":") ? key.split(":")[1] : key;
            newObj[cleanedKey] = CleanXmlJson(obj[key]);
        }
        return newObj;
    }
    return obj;
}
