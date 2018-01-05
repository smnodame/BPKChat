export const Conversations = [
  {
    withUserId: 1,
    messages: [
      {
        id: 0,
        type: 'out',
        time: -300,
        url: '',
        text: 'Hey, how’ve you been?',
        format: 'text'
      },
      {
        id: 1,
        time: -240,
        type: 'in',
        url: '',
        text: 'Yeah, not bad, actually I finally got a call back from that job that I interviewed for, and guess what? I got it!',
        format: 'text'
      },
      {
        id: 2,
        time: -230,
        type: 'out',
        url: '',
        text: 'Awesome! Yeah, well done, that’s really great to hear. Do you start right away?',
        format: 'text'
      },
      {
        id: 3,
        time: -100,
        type: 'out',
        url: '',
        text: 'Well, uhm yes and no, I go in for training tomorrow, but I don’t really start until next week. ' +
        'Do you have some time this weekend, maybe we could get together?',
        format: 'text'
      },
      {
        id: 4,
        time: -100,
        type: 'out',
        url: 'http://www.filmgamed.com/wp-content/uploads/2016/04/ZootopiaIN.jpg',
        text: 'Image',
        format: 'image'
      },
      {
        id: 5,
        time: -45,
        type: 'in',
        url: '',
        text: 'I’ve got a lot planned this weekend, just running around, doing loads of stuff, but Friday’s pretty open.',
        format: 'text'
      },
      {
        id: 6,
        time: -5,
        type: 'out',
        text: 'That works pretty well for me!',
        url: '',
        format: 'text'
    },
        {
        id: 7,
        time: -2,
        type: 'out',
        text: 'Sticker',
        url: 'http://cdn-th.tunwalai.net/files/member/2781675/1747465371-member.jpg',
        format: 'sticker'
    }]
  },
  {
    withUserId: 5,
    messages: [
      {
        id: 0,
        type: 'out',
        time: -300,
        text: 'I have no idea what to buy for Mary for her birthday.',
        format: '',
        url: ''
      },
      {
        id: 1,
        time: -240,
        type: 'in',
        text: 'Me, neither! Would you like to go in and buy her a gift together?',
        format: '',
        url: ''
      },
      {
        id: 2,
        time: -100,
        type: 'out',
        text: 'If I remember right, she likes music, skiing, and reading',
        format: '',
        url: ''
      },
      {
        id: 3,
        time: -45,
        type: 'out',
        text: 'You know, maybe we could get her some concert tickets. Who would know her favorite groups?',
        format: '',
        url: ''
      },
      {
        id: 4,
        time: -25,
        type: 'in',
        text: 'Her roommate, Malia, might know what her favorite groups are.',
        format: '',
        url: ''
      },
      {
        id: 5,
        time: -5,
        type: 'out',
        text: 'Cool! Let\'s give Malia a call and ask her for her help right now',
        format: '',
        url: ''
      }]
  }
];

export default Conversations;
