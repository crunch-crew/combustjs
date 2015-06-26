module.exports = {
  ".read": "true",
  ".write": "true",
  "users": {
    ".read": "$user.username !== undefined",
    "$user": {
      ".read": "$user.username === $data.username",
    },
    "test": {
      ".read": "false",
      ".write": "false"
    }
  }
}