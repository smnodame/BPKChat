import {Conversation, User, Version, Photo, Message} from './schemas';

export default [
  {
    schema: [User, Version, Conversation, Photo, Message],
    schemaVersion: 1,
    migration(oldRealm, newRealm) {

    }
  }
];
