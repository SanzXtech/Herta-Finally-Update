import _data from "../../lib/totalcmd.js"
let handler = async (m, {q,conn,isOwner,setReply,args,usedPrefix,command}) => {
    const DataId = db.data.data
    const Input = !m.isGroup? m.numberQuery : m.mentionByTag[0]? m.mentionByTag[0] : m.mentionByReply ? m.mentionByReply : q? m.numberQuery : false
        if (!isOwner) return setReply(mess.only.ownerB)
    if(!q) return setReply("Masukan nomer target")
        try {
        if(!_data.checkDataId("reseller", Input, DataId)) return setReply(`User bukan reseller`)
        _data.removeDataId ("reseller", Input, DataId)
        setReply(`Berhasil menghapus ${Input.split("@")[0]} dari daftar reseller`)
        } catch (err){
        console.log(err)
        setReply(`${err}`)
        }
        
    
}
handler.help = ["delreseller reply nomer"]
handler.tags = ["owner"];
handler.command = ['delreseller']
handler.owner = true
export default handler
