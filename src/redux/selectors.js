export const getFriendGroups = state => {
    return state.friend.friendGroups
}

export const getFriends = (state) => {
    return state.friend.friends
}

export const getNumberOfGroup = state => {
    return state.friend.numberOfFriendLists
}

export const getRangeOfGroup = state => {
    return state.friend.rangeFriendLists
}

export const getFilterFriend = state => {
    return state.friend.filter
}

export const navigateSelector = state => {
    return state.system.navigate
}