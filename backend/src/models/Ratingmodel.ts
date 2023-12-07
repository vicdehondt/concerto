import { ARRAY, DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { UserModel } from './Usermodel';
import { CheckedInUsers, retrieveCheckIn } from './Checkinmodel';
import { RetrieveEvent } from './Eventmodel';

export const Rating = sequelize.define('Rating', {
    ratingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    amountOfReviews: {
        allowNull: false,
        defaultValue: 0,
        type: DataTypes.INTEGER
    },
    entityType: {
        type: DataTypes.ENUM('artist', 'venue'),
        allowNull: false,
    },
    score: {
        type: DataTypes.FLOAT,
        allowNull: true,
    }
});

export const Review = sequelize.define('Review', {
    reviewID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    eventID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    score: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: true,
            min: 1,
            max: 5,
          }
    }
});

Rating.hasMany(Review, {
    foreignKey: {
        name: 'ratingID',
        allowNull: false
    }
});
Review.belongsTo(Rating, {
    foreignKey: {
        name: 'ratingID'
    }
});

UserModel.hasMany(Review, {
    foreignKey: {
        name: 'userID',
        allowNull: false
    }
});
Review.belongsTo(UserModel, {
    foreignKey: {
        name: 'userID'
    }
});

export async function createReview(userID, rating, eventID, score, message) {
    const alreadyReviewed = await Review.findOne({
        where: {
            eventID: eventID,
            userID: userID,
            ratingID: rating.ratingID
        }
    });
    if (alreadyReviewed == null) {
        Review.create({
            eventID: eventID,
            userID: userID,
            ratingID: rating.ratingID,
            score: score,
            message: message,
        });
        const previousVotes = rating.amountOfReviews;
        rating.amountOfReviews = previousVotes + 1;
        const newScore = calculateNewScore(rating.score, previousVotes, score);
        if (rating.score == null) {
            rating.score = score;
        } else {
            rating.score = newScore;
        } await rating.save();
        return true;
    } else {
        return false;
    }
}

function calculateNewScore(currentScore, amountOfVotes, newValue) {
    const previousSum = currentScore * amountOfVotes;
    console.log("Previoussum: ", previousSum);
    const newSum = (previousSum + Number(newValue));
    console.log("new sum: ", newSum);
    const newScore = newSum / (amountOfVotes + 1);
    console.log(newScore);
    return newScore;
}