import { redirect } from "next/navigation";
import { getChatGPTUser, requireChatGPTUser } from "@/app/chatgpt-auth";
import CadastrosAdmin from "./view";

export const dynamic = "force-dynamic";
const ADMIN_EMAIL = "casadosbartenders@gmail.com";

export default async function CadastrosPage() {
  const user = await getChatGPTUser();
  if (!user) await requireChatGPTUser("/admin/cadastros");
  if (user?.email.toLowerCase() !== ADMIN_EMAIL) redirect("/");
  return <CadastrosAdmin />;
}
