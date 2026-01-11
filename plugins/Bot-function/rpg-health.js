let handler = (m) => m;

handler.before = async function (m) {
  let user = db.data.users[m.sender];
  if (user) {
    if (user.health > 200) {
      user.health = 200;
    }
    if (user.health < 0) {
      user.health = 0;
    }

    if (user.stamina > 200) {
      user.stamina = 200;
    }
    if (user.stamina < 0) {
      user.stamina = 0;
    }
  }
};

export default handler;
