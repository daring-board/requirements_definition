import { Task } from "@/types"
import { Button } from "@/components/ui/button"
import { FileText, Users, MessageSquare, Eye } from "lucide-react"
import { useRouter } from "next/router"

export function Sidebar({
  tasks,
  currentTaskId,
