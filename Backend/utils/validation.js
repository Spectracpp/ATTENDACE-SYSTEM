const Joi = require('joi');

const qrGenerationSchema = Joi.object({
    organisation_uid: Joi.string().required(),
    roll_no: Joi.string().required()
});

const qrScanSchema = Joi.object({
    qr_id: Joi.string().required(),
    attendance_type: Joi.string().valid('full', 'half').default('full')
});

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        next();
    };
};

module.exports = {
    validateQrGeneration: validateRequest(qrGenerationSchema),
    validateQrScan: validateRequest(qrScanSchema)
};
