import realm from './realm/realm'
import users from './raw/users'
import conversations from './raw/conversations'


function truncate() {
  realm.write(() => {
    realm.delete(realm.objects('User'));
    realm.delete(realm.objects('Conversation'));
    realm.delete(realm.objects('Version'));
  });
}

function populateUsers() {
  for (let user of users) {
    let images = user.images;
    user.images = [];
    realm.write(() => {
      let created = realm.create('User', user);
      for (let i of images)
        created.images.push({id: i});
    });
  }
}

function populateConversations() {
  for (let conversation of conversations) {
    let messages = [];

    for (let message of conversation.messages) {
      realm.write(() => {
        messages.push(realm.create('Message', message));
      })
    }

    conversation.messages = messages;
    conversation.withUser = realm.objects('User')
      .filtered(`id="${conversation.withUserId}"`)[0];
    realm.write(() => {
      realm.create('Conversation', conversation)
    })
  }
}

function populateVersion() {
  realm.write(() => {
    realm.create('Version', {id: 0})
  })
}

let populate = () => {
  let version = realm.objects('Version');
  console.log('version ', version)
  if (version && version.length > 0) {
      console.log(' existing ')
      return;
  }


  //truncate();
  console.log(' populate version ')
  populateVersion();
  console.log(' populate user ')
  populateUsers();
  console.log(' populate conversations ')
  populateConversations();
};

export default populate
