import Realm from 'realm';

export class User extends Realm.Object { }
User.schema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: {type: 'int'},
    firstName: {type: 'string'},
    lastName: {type: 'string'},
    phone: {type: 'string'},
    country: {type: 'string'},
    email: {type: 'string'},
    password: {type: 'string'},
    newPassword: {type: 'string'},
    confirmPassword: {type: 'string'},
    photo: {type: 'int'},
    postCount: {type: 'int'},
    followersCount: {type: 'int'},
    followingCount: {type: 'int'},
    images: {type: 'list', objectType: 'Photo'}
  }
};

export class Conversation extends Realm.Object { }
Conversation.schema = {
  name: 'Conversation',
  properties: {
    withUser: 'User',
    messages: {type: 'list', objectType: 'Message'}
  }
};

export class Message extends Realm.Object { }
Message.schema = {
  name: 'Message',
  properties: {
    id: 'int',
    text: 'string',
    time: 'int',
    type: 'string',
    format: 'string',
    url: 'string'
  }
};

export class Photo extends Realm.Object { }
Photo.schema = {
  name: 'Photo',
  properties: {
    id: 'int'
  }
};

export class Version extends Realm.Object { }
Version.schema = {
  name: 'Version',
  properties: {
    id: 'int'
  }
};
