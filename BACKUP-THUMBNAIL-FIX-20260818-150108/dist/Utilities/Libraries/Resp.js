export default (res, status, message, success, additionalData) => {
    return res.status(status || 200).send({
        success: success === null || success === undefined ? true : success,
        message: message || "Success",
        ...additionalData
    });
};
