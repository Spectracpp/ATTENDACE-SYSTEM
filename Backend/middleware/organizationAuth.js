const User = require('../models/User');

// Check if user belongs to organization
exports.belongsToOrganization = async (req, res, next) => {
    try {
        const orgId = req.params.orgId;
        const user = await User.findOne({
            _id: req.user._id,
            'organizations.organization': orgId,
            'organizations.status': 'active'
        });

        if (!user) {
            return res.status(403).json({ message: 'Not a member of this organization' });
        }

        // Add organization role to request
        const orgMembership = user.organizations.find(
            org => org.organization.toString() === orgId
        );
        req.organizationRole = orgMembership.role;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking organization membership' });
    }
};

// Check if user has specific role in organization
exports.hasRole = (roles) => {
    return async (req, res, next) => {
        try {
            const orgId = req.params.orgId;
            const user = await User.findOne({
                _id: req.user._id,
                'organizations.organization': orgId,
                'organizations.status': 'active'
            });

            if (!user) {
                return res.status(403).json({ message: 'Not a member of this organization' });
            }

            const orgMembership = user.organizations.find(
                org => org.organization.toString() === orgId
            );

            if (!roles.includes(orgMembership.role)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            req.organizationRole = orgMembership.role;
            next();
        } catch (error) {
            res.status(500).json({ message: 'Error checking role permissions' });
        }
    };
};

// Check if user is organization admin
exports.isAdmin = async (req, res, next) => {
    try {
        const orgId = req.params.orgId;
        const user = await User.findOne({
            _id: req.user._id,
            'organizations.organization': orgId,
            'organizations.role': 'admin',
            'organizations.status': 'active'
        });

        if (!user) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking admin permissions' });
    }
};

// Check if user can mark attendance
exports.canMarkAttendance = async (req, res, next) => {
    try {
        const orgId = req.params.orgId;
        const user = await User.findOne({
            _id: req.user._id,
            'organizations.organization': orgId,
            'organizations.status': 'active'
        });

        if (!user) {
            return res.status(403).json({ message: 'Not a member of this organization' });
        }

        const orgMembership = user.organizations.find(
            org => org.organization.toString() === orgId
        );

        // Only students and employees can mark attendance
        if (!['student', 'employee'].includes(orgMembership.role)) {
            return res.status(403).json({ message: 'Not authorized to mark attendance' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking attendance permissions' });
    }
};

// Check if user can manage sessions
exports.canManageSessions = async (req, res, next) => {
    try {
        const orgId = req.params.orgId;
        const user = await User.findOne({
            _id: req.user._id,
            'organizations.organization': orgId,
            'organizations.status': 'active'
        });

        if (!user) {
            return res.status(403).json({ message: 'Not a member of this organization' });
        }

        const orgMembership = user.organizations.find(
            org => org.organization.toString() === orgId
        );

        // Only admins and teachers can manage sessions
        if (!['admin', 'teacher'].includes(orgMembership.role)) {
            return res.status(403).json({ message: 'Not authorized to manage sessions' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking session management permissions' });
    }
};
