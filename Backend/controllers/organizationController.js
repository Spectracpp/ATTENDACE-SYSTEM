const Organization = require('../models/Organization');
const User = require('../models/User');
const { sendInvitationEmail } = require('../utils/emailService');
const crypto = require('crypto');

// Create a new organization
exports.createOrganization = async (req, res) => {
    try {
        const { name, code, description, type } = req.body;

        // Create organization
        const organization = new Organization({
            name,
            code,
            description,
            type,
            createdBy: req.user._id,
            admins: [{
                user: req.user._id,
                role: 'owner'
            }]
        });

        await organization.save();

        // Add organization to user's organizations
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                organizations: {
                    organization: organization._id,
                    role: 'admin',
                    status: 'active'
                }
            },
            primaryOrganization: organization._id
        });

        res.status(201).json({
            message: 'Organization created successfully',
            organization
        });
    } catch (error) {
        console.error('Create organization error:', error);
        res.status(500).json({ message: 'Error creating organization' });
    }
};

// Invite user to organization
exports.inviteUser = async (req, res) => {
    try {
        const { email, role, department, employeeId } = req.body;
        const { orgId } = req.params;

        // Check if user has admin rights
        const adminUser = await User.findOne({
            _id: req.user._id,
            'organizations.organization': orgId,
            'organizations.role': 'admin',
            'organizations.status': 'active'
        });

        if (!adminUser) {
            return res.status(403).json({ message: 'Not authorized to invite users' });
        }

        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        
        // Create or update invitation
        const organization = await Organization.findByIdAndUpdate(
            orgId,
            {
                $push: {
                    invitations: {
                        email,
                        role,
                        department,
                        employeeId,
                        token: invitationToken,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                    }
                }
            },
            { new: true }
        );

        // Send invitation email
        await sendInvitationEmail(email, {
            organizationName: organization.name,
            role,
            invitationToken,
            invitedBy: `${req.user.firstName} ${req.user.lastName}`
        });

        res.json({
            message: 'Invitation sent successfully',
            invitation: {
                email,
                role,
                department,
                employeeId
            }
        });
    } catch (error) {
        console.error('Invite user error:', error);
        res.status(500).json({ message: 'Error sending invitation' });
    }
};

// Accept organization invitation
exports.acceptInvitation = async (req, res) => {
    try {
        const { token } = req.params;

        // Find organization with valid invitation
        const organization = await Organization.findOne({
            'invitations.token': token,
            'invitations.expiresAt': { $gt: new Date() }
        });

        if (!organization) {
            return res.status(400).json({ message: 'Invalid or expired invitation' });
        }

        const invitation = organization.invitations.find(inv => inv.token === token);

        // Add user to organization
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                organizations: {
                    organization: organization._id,
                    role: invitation.role,
                    status: 'active',
                    department: invitation.department,
                    employeeId: invitation.employeeId
                }
            }
        });

        // Remove invitation
        await Organization.findByIdAndUpdate(organization._id, {
            $pull: { invitations: { token } }
        });

        res.json({
            message: 'Successfully joined organization',
            organization: {
                id: organization._id,
                name: organization.name,
                role: invitation.role
            }
        });
    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ message: 'Error accepting invitation' });
    }
};

// Get organization members
exports.getMembers = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { role, department, status, search } = req.query;

        // Build query
        const query = {
            'organizations.organization': orgId
        };

        if (role) query['organizations.role'] = role;
        if (department) query['organizations.department'] = department;
        if (status) query['organizations.status'] = status;
        if (search) {
            query.$or = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const users = await User.find(query)
            .select('firstName lastName email organizations')
            .lean();

        // Format response
        const members = users.map(user => {
            const orgMembership = user.organizations.find(
                org => org.organization.toString() === orgId
            );
            return {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: orgMembership.role,
                department: orgMembership.department,
                employeeId: orgMembership.employeeId,
                status: orgMembership.status,
                joinedAt: orgMembership.joinedAt
            };
        });

        res.json({
            total: members.length,
            members
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ message: 'Error fetching members' });
    }
};

// Update member role
exports.updateMemberRole = async (req, res) => {
    try {
        const { orgId, userId } = req.params;
        const { role, department, employeeId } = req.body;

        // Check if requester has admin rights
        const adminUser = await User.findOne({
            _id: req.user._id,
            'organizations.organization': orgId,
            'organizations.role': 'admin',
            'organizations.status': 'active'
        });

        if (!adminUser) {
            return res.status(403).json({ message: 'Not authorized to update roles' });
        }

        // Update user's organization role
        const user = await User.findOneAndUpdate(
            {
                _id: userId,
                'organizations.organization': orgId
            },
            {
                $set: {
                    'organizations.$.role': role,
                    'organizations.$.department': department,
                    'organizations.$.employeeId': employeeId
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found in organization' });
        }

        res.json({
            message: 'Member role updated successfully',
            user: {
                id: user._id,
                email: user.email,
                role,
                department,
                employeeId
            }
        });
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ message: 'Error updating member role' });
    }
};

// Remove member from organization
exports.removeMember = async (req, res) => {
    try {
        const { orgId, userId } = req.params;

        // Check if requester has admin rights
        const adminUser = await User.findOne({
            _id: req.user._id,
            'organizations.organization': orgId,
            'organizations.role': 'admin',
            'organizations.status': 'active'
        });

        if (!adminUser) {
            return res.status(403).json({ message: 'Not authorized to remove members' });
        }

        // Remove organization from user's organizations
        await User.findByIdAndUpdate(userId, {
            $pull: { organizations: { organization: orgId } }
        });

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ message: 'Error removing member' });
    }
};

// Set primary organization
exports.setPrimaryOrganization = async (req, res) => {
    try {
        const { organizationId } = req.body;

        // Check if user belongs to organization
        const user = await User.findOne({
            _id: req.user._id,
            'organizations.organization': organizationId,
            'organizations.status': 'active'
        });

        if (!user) {
            return res.status(400).json({ message: 'Not a member of this organization' });
        }

        // Update primary organization
        user.primaryOrganization = organizationId;
        await user.save();

        res.json({
            message: 'Primary organization updated',
            primaryOrganization: {
                id: organizationId
            }
        });
    } catch (error) {
        console.error('Set primary organization error:', error);
        res.status(500).json({ message: 'Error updating primary organization' });
    }
};
