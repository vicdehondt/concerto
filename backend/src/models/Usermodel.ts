import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { mailAccount, mailPassword } from '../configs/mailConfig';

const nodemailer = require('nodemailer');

const privacySettings = DataTypes.ENUM('public', 'private', 'friends')

export function isValidPrivacySetting(setting): boolean {
    return privacySettings.values.includes(setting);
}

export const privacyErrorMsg = 'You are not allowed to see this information according to the privacy settings of this user!';

export const UserModel = sequelize.define('User', {
    userID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    username: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mail: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    privacyAttendedEvents: {
        type: privacySettings,
        defaultValue: 'public'
    },
    privacyCheckedInEvents: {
        type: privacySettings,
        defaultValue: 'public'
    },
    privacyFriends: {
        type: privacySettings,
        defaultValue: 'public'
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: "Hello, welcome to my profile page."
    },
    firstGenre: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    secondGenre: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    salt: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image: { type: DataTypes.STRING,
            allowNull: true
    }}, {
    tableName: 'Users'
    }
);

export const Friend = sequelize.define('Friend',{
    friendID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM('accepted', 'pending'),
        allowNull: false,
    },
})

Friend.belongsTo(UserModel, {
    foreignKey: 'senderID',
    as: 'sender',
    onDelete: 'CASCADE',
});

Friend.belongsTo(UserModel, {
    foreignKey: 'receiverID',
    as: 'receiver',
    onDelete: 'CASCADE',
});

UserModel.belongsToMany(UserModel, {
    through: Friend,
    as: 'sender',
    foreignKey: 'senderID',
    onDelete: 'CASCADE',
});

UserModel.belongsToMany(UserModel, {
    through: Friend,
    as: 'receiver',
    foreignKey: 'receiverID',
    onDelete: 'CASCADE',
});

export async function DeleteUser(userID) {
    await UserModel.destroy({
        where: {
            userID: userID,
        }
    });
}

export async function CreateUser(username, email, genre1, genre2, hashedpassword, saltingrounds) {
    try {
        const User = await UserModel.create({
            username: username,
            mail: email,
            password: hashedpassword,
            salt: saltingrounds,
            firstGenre: genre1,
            secondGenre: genre2
        });
        return User;
    } catch (error) {
        console.error("There was an error creating a user:", error);
    }
}

export async function GetAllFriends(userID) {
    const friends = await Friend.findAll({
        attributes: ['receiverID', 'senderID'],
        include: [
            { model: UserModel, as: 'receiver', attributes: ['userID', 'username', 'image' ]},
            { model: UserModel, as: 'sender', attributes: ['userID', 'username', 'image' ]},
        ],
        where: {
            status: 'accepted',
            [Op.or]: [
                { receiverID: userID },
                { senderID: userID }
            ]
        }
    });
    const result = friends.map(friendrelationship => {
        var friend = null;
        if (friendrelationship.receiverID == userID) {
            friend = friendrelationship.sender;
        } else {
            friend = friendrelationship.receiver;
        };
        return friend;
    });
    return result;
}

async function CreateFriend(senderID, receiverID) {
    const newfriend = await Friend.create({
        status: 'pending',
        senderID: senderID,
        receiverID: receiverID,
    });
}

export async function FindFriend(senderID, receiverID) { // Procedure does not work in 2 way;
    const existing = await Friend.findOne({
        where: {
            [Op.or]: [
                {
                    [Op.and]: [
                        { receiverID: senderID },
                        { senderID: receiverID },
                    ]
                }, {
                    [Op.and]: [
                        { receiverID: receiverID },
                        { senderID: senderID },
                    ]
                }
            ]
        }
    });
    return existing;
}

export const FriendInviteResponses = {
    SENT: 0,
    ALREADYFRIEND: 1,
    USERNOTFOUND: 2,
    ILLEGALREQUEST: 3,
}

export async function SendFriendRequest(senderID, receiverid): Promise<Number> {
    const receiver = await RetrieveUser('userID', receiverid);
    if (receiver != null) {
        if (receiverid != senderID) {
            const existing = await FindFriend(senderID, receiverid);
            if (existing == null) {
                await CreateFriend(senderID, receiverid);
                return FriendInviteResponses.SENT;
            } else {
                return FriendInviteResponses.ALREADYFRIEND;
            }
        } else {
            return FriendInviteResponses.ILLEGALREQUEST;
        }
    } else {
        return FriendInviteResponses.USERNOTFOUND;
    }
}

export async function RetrieveUser(field: string, value): Promise<typeof UserModel> {
    try {
        const User = await UserModel.findOne({
        where: { [field]: value},
        });
        return User;
      } catch (error) {
        console.error("There was an error finding a user: ", error);
      }
}

// Source: https://nodemailer.com
const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
       auth: {
            user: mailAccount,
            pass: mailPassword,
         },
    secure: true,
    });

export async function sendMailVerification(username, mail) {
    const mailData = {
        from: mailAccount,  // sender address
        to: mail,   // list of receivers
        subject: 'Verify your mail for concerto',
        text: 'That was easy!',
        html: '<b> Thank you for registering on Concerto! </b>'
    };
    await transporter.sendMail(mailData);
}