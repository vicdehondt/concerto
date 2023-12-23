import { DataTypes } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { UserModel } from './Usermodel';

// Each rating object contains the total score and belongs to one artist or to one venue. Not both.
// Ratings then consist of multiple reviews.
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
    entityType: { // A rating either belongs to an artist or to a venue
        type: DataTypes.ENUM('artist', 'venue'),
        allowNull: false,
    },
    artistID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Artists',
            key: 'artistID',
        },
        allowNull: true,
    },
    venueID: {
        type: DataTypes.STRING,
        references: {
            model: 'Venues',
            key: 'venueID',
        },
        allowNull: true,
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
// Each rating can have multiple reviews.
Rating.hasMany(Review, {
    foreignKey: {
        name: 'ratingID',
        allowNull: false
    }
});
// A review can only belong to one rating object.
Review.belongsTo(Rating, {
    foreignKey: {
        name: 'ratingID'
    }
});
// Each user can have multiple reviews.
UserModel.hasMany(Review, {
    foreignKey: {
        name: 'userID',
        allowNull: false
    }
});
// And each review can only belong to one user.
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
        return true; // Successfully created a review.
    } else {
        return false; // Already reviewed this event.
    }
}

// Calculate the new total score based on the previous total score and the new given  score.
function calculateNewScore(currentScore, amountOfVotes, newValue) {
    const previousSum = currentScore * amountOfVotes;
    console.log("Previoussum: ", previousSum);
    const newSum = (previousSum + Number(newValue));
    console.log("new sum: ", newSum);
    const newScore = newSum / (amountOfVotes + 1);
    console.log(newScore);
    return newScore;
}