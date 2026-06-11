const authorizeRoles = (...roles) => {

    return (req, res, next) => {
        console.log("REQ.USER FULL:", req.user);
        console.log("TYPE OF ROLE:", typeof req.user.role);
        console.log("ROLE VALUE:", JSON.stringify(req.user.role));
        console.log("User role:", req.user.role);
        console.log("Allowed roles:", roles);
        if (!roles.includes(req.user.role)) {
            console.log("ACCESS DENIED")

            return res.status(403).send({
                message: "Access denied"
            })
        }

        next()
    }
}

module.exports = { authorizeRoles }