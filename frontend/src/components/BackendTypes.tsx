// All the types used in components or pages.

export type APIResponse = {
  created: string;
  artists: Array<Artist>;
};

export type Venue = {
  venueID: string;
  venueName: string;
  longitude: number;
  lattitude: number;
  Rating: {
    score: number;
    amountOfReviews: number;
    ratingID: number;
  };
};

export type Notification = {
  notificationID: number;
  receiver: number;
  status: string;
  objectID: number;
  NotificationObject: {
    notificationType: string;
    actor: number;
    typeID: number;
  };
};

export type Filter = {
  venueID: string | null;
  date: Date | null;
  genre: Array<string> | null;
  minPrice: string | null;
  maxPrice: string | null;
};

export type Rating = {
  score: number;
  amountOfReviews: number;
};

export type Artist = {
  id: string;
  artistID: string;
  name: string;
  type: string;
  ratingID: number;
  Rating: {
    score: number;
    amountOfReviews: number;
  };
};

export type Event = {
  eventID: number;
  title: string;
  description: string;
  amountCheckedIn: number;
  dateAndTime: string;
  support: string;
  doors: string;
  main: string;
  baseGenre: string;
  secondGenre: string;
  price: number;
  banner: string;
  eventPicture: string;
  checkedIn: boolean;
  Artist: Artist;
  Venue: Venue;
  url: string;
};

export type Profile = {
  image: string;
  username: string;
  userID: number;
  mail: string;
  privacyAttendedEvents: string;
  privacyCheckedInEvents: string;
  privacyFriends: string;
  firstGenre: string;
  secondGenre: string;
};

export type User = {
  username: string;
  userID: number;
  mail: string;
  image: string;
  privacyAttendedEvents: string;
  privacyCheckedInEvents: string;
  privacyFriends: string;
  description: string;
  friendship?: string;
};

export type Review = {
  reviewID: number;
  eventID: number;
  message: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  ratingID: number;
  userID: number;
};

export type Friend = {
  userID: number;
  username: string;
  image: string;
};

export type Error = {
  type: string;
  value: string;
  msg: string;
  message: string;
};

export type Wish = {
  wishlistID: number;
  userID: number;
  createdAt: string;
  updatedAt: string;
  Event: Event;
};
