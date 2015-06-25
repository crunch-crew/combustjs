module.exports = {
  "root": {
    ".write": "false",
    "authtest": {
      ".read": "1 + 2 === 2",
      ".write": "3 + 3 === 6",
      "authtestnested": {
        ".read": "1 + 1 === 2",
        ".write": "3 + 5 === 6",
        "morenesting": {
          ".read": "false",
        } 
      },
    }
  }
}