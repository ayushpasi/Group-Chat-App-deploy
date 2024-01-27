const GroupModel = require("../models/groupModel");
const UserGroup = require("../models/userGroup");
const { Op } = require("sequelize");
const UserModel = require("../models/userModel");
const sequelize = require("../util/database");

const createGroup = async (req, res, next) => {
  const t = await sequelize.transaction(); // Start a transaction
  try {
    const groupName = req.body.groupName;
    const admin = req.user.name;
    const adminId = req.user.id;
    const members = req.body.members;

    const membersArray = Array.isArray(members) ? members : [members];

    const group = await GroupModel.create(
      { name: groupName, admin: admin, adminId: adminId },
      { transaction: t }
    );

    if (membersArray.length > 0) {
      // Check if there are any members before creating entries in UserGroup
      const invitedMembers = await UserModel.findAll({
        where: {
          email: {
            [Op.or]: membersArray,
          },
        },
        transaction: t,
      });

      await Promise.all(
        invitedMembers.map(async (user) => {
          const response = await UserGroup.create(
            {
              isadmin: false,
              userId: user.dataValues.id,
              groupId: group.dataValues.id,
            },
            { transaction: t }
          );
        })
      );
    }

    await UserGroup.create(
      {
        isadmin: true,
        userId: req.user.id,
        groupId: group.dataValues.id,
      },
      { transaction: t }
    );

    // Commit the transaction
    await t.commit();

    res
      .status(201)
      .json({ group: group.dataValues.name, members: membersArray });
  } catch (error) {
    console.error(error);
    // Rollback the transaction in case of an error
    await t.rollback();
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//finding all the group associated with the user
const getGroups = async (req, res, next) => {
  try {
    const groups = await GroupModel.findAll({
      attributes: ["name", "admin", "id"],
      include: [
        {
          model: UserGroup,
          where: { userId: req.user.id },
        },
      ],
    });
    res.status(200).json({ groups: groups });
  } catch (error) {
    console.log(error);
  }
};

//Getting group details by group id
const getGroupbyId = async (request, response, next) => {
  try {
    const { groupId } = request.query;
    const group = await GroupModel.findOne({ where: { id: Number(groupId) } });
    response
      .status(200)
      .json({ group, message: "Group details succesfully fetched" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal Server error!" });
  }
};

const getGroupMembersbyId = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;

    const userGroup = await UserGroup.findAll({
      where: { groupId: groupId },
    });

    const users = [];

    await Promise.all(
      userGroup.map(async (user) => {
        const res = await UserModel.findOne({
          where: { id: user.dataValues.userId },
        });
        users.push(res);
      })
    );
    res.status(200).json({ users: users });
  } catch (error) {
    console.log(error);
  }
};
const updateGroup = async (req, res, next) => {
  const t = await sequelize.transaction(); // Start a transaction
  try {
    const groupId = req.query.groupId; // Assuming the group ID is provided in the request params
    const groupName = req.body.groupName;
    const admin = req.user.name;
    const adminId = req.user.id;
    const members = req.body.members;

    // Log values for debugging
    console.log("groupId:", groupId);
    console.log("groupName:", groupName);
    console.log("admin:", admin);
    console.log("adminId:", adminId);
    console.log("members:", members);

    const membersArray = Array.isArray(members) ? members : [members];

    // Update group details
    const [updatedRows] = await GroupModel.update(
      { name: groupName, admin: admin, adminId: adminId },
      { where: { id: groupId }, transaction: t }
    );

    if (updatedRows === 0) {
      throw new Error("Group not found");
    }

    // Remove existing group members excluding the admin
    await UserGroup.destroy({
      where: { groupId: groupId, userId: { [Op.ne]: adminId } },
      transaction: t,
    });

    if (membersArray.length > 0) {
      // Add new members to the group
      const invitedMembers = await UserModel.findAll({
        where: {
          email: {
            [Op.or]: membersArray,
          },
        },
        transaction: t,
      });
      // Only attempt to create entries in UserGroup if there are new members
      await Promise.all(
        invitedMembers.map(async (user) => {
          const response = await UserGroup.create(
            {
              isadmin: false,
              userId: user.dataValues.id,
              groupId: groupId,
            },
            { transaction: t }
          );
        })
      );
    }

    // Commit the transaction
    await t.commit();

    res.status(200).json({ message: "Group updated successfully" });
  } catch (error) {
    console.error(error);
    // Rollback the transaction in case of an error
    await t.rollback();
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupbyId,
  getGroupMembersbyId,
  updateGroup,
};
