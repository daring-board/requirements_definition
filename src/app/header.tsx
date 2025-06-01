import { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"

export function Header({ user }: { user: User }) {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-white text-xl font-bold">要件定義</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <span className="text-white">{user.name}</span>
          </div>
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </header>
  )
}
