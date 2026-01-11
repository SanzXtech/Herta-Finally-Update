import _data from "../../lib/totalcmd.js"
let handler = async (m, { conn, setReply, isOwner }) => {
  const DataId = db.data.data
  if (!_data.checkDataName("reseller", "", DataId)) await _data.createDataId("reseller", DataId)
  const list = _data.getDataId("reseller", DataId) || []
  if (!list || list.length === 0) return setReply("Belum ada reseller terdaftar")
  let txt = `📋 Daftar Reseller (${list.length})\n\n`
  for (let i of list) txt += `• wa.me/${i.split("@")[0]}\n`
  setReply(txt)
}
handler.help = ["listreseller"]
handler.tags = ["owner"]
handler.command = ["listreseller"]
handler.owner = true
export default handler
