function validateDto(ajvValidate) {
    return (req, res, next) => {
        const valid = ajvValidate(req.body);
        
        if (!valid) {
            const errors = ajvValidate.errors;
            res.status(400).json({ status: false, message: errors[0].message });
        } else {
            next();
        }
    };
}

module.exports = validateDto;