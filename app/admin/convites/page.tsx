import { redirect } from "next/navigation";
import { getChatGPTUser, requireChatGPTUser } from "@/app/chatgpt-auth";
import ConvitesAdmin from "./view";
export const dynamic="force-dynamic";
const ADMIN="casadosbartenders@gmail.com";
export default async function ConvitesPage(){const user=await getChatGPTUser();if(!user) await requireChatGPTUser("/admin/convites");if(user?.email.toLowerCase()!==ADMIN) redirect("/");return <ConvitesAdmin/>;}