"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, FileText, Trash2, Edit, Search, Calendar } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
  progress: number
}

interface SidebarProps {
  tasks: Task[]
  currentTaskId: string | null
  onTaskSelect: (taskId: string) => void
  onTaskCreate: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  onTaskDelete: (taskId: string) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
}

export function Sidebar({
  tasks,
  currentTaskId,
  onTaskSelect,
  onTaskCreate,
  onTaskDelete,
  onTaskUpdate,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onTaskCreate({
        title: newTaskTitle,
        description: newTaskDescription,
        progress: 0,
      })
      setNewTaskTitle("")
      setNewTaskDescription("")
      setIsCreateDialogOpen(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">要件定義タスク</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">新しいタスクを作成</DialogTitle>
                <DialogDescription className="text-slate-400">新しい要件定義タスクを作成します。</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-white">
                    タイトル
                  </Label>
                  <Input
                    id="title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="タスクのタイトルを入力"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-white">
                    説明
                  </Label>
                  <Input
                    id="description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="タスクの説明を入力"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700">
                  作成
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タスクを検索..."
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">
                {searchQuery ? "検索結果が見つかりません" : "タスクがありません"}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  currentTaskId === task.id
                    ? "border-blue-500 bg-blue-950/50"
                    : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                }`}
                onClick={() => onTaskSelect(task.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white text-sm truncate flex-1">{task.title}</h3>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Edit functionality would go here
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskDelete(task.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {task.description && <p className="text-slate-400 text-xs mb-2 line-clamp-2">{task.description}</p>}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatDate(task.updatedAt)}
                  </div>
                  <div className="text-xs text-slate-400">{task.progress}/4 完了</div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-600 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(task.progress / 4) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
