module.exports = {
  "/": {
    ".read": "true",
    ".write": "true",
  },
  "users": {
    "$user": {
      ".read": "$user.id === $data.id",
      ".write": "$user.id === $data.id"
    }
  }
}