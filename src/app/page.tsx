"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, ArrowRight, ArrowLeft, FileText, Users, MessageSquare, Eye, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Task, StepData, defaultStepData } from "@/types"

// Supabase imports
import { createClient } from '@supabase/supabase-js';

// Supabase クライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export default function RequirementsDefinitionApp() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [stepData, setStepData] = useState<StepData>(defaultStepData)
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);

  const user = {
    id: "anonymous-user-id", // ユーザーID
    name: "田中 太郎", // ユーザー名
    email: "tanaka@example.com", // ユーザーメール
    avatar: "/placeholder.svg?height=40&width=40", // アバター画像
  }

  // Supabaseの認証とユーザーIDの取得
  useEffect(() => {
    setIsSupabaseLoading(false); // Supabaseのロード完了をシミュレート

    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
      } else {
        console.log("No user session found, using anonymous user.");}
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Supabaseからタスクをリアルタイムで読み込む
  useEffect(() => {
    if (!user.id || isSupabaseLoading) {
      console.log("Supabase or User ID not ready for fetching tasks.");
      return;
    }

    // 初期データフェッチ
    const fetchInitialTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('updated_at', { ascending: false }); // 最新の更新日時でソート
        if (error) throw error;

        const fetchedTasks: Task[] = data.map((task: Task) => ({
          id: task.id,
          title: task.title || "新しいタスク",
          description: task.description || "タスクの説明がありません",
          stepData: task.stepData || defaultStepData,
          completedSteps: getCompletedStepsFromData(task.stepData || defaultStepData),
          progress: task.progress || 0,
          created_at: new Date(task.created_at),
          updated_at: new Date(task.updated_at),
        }));
        setTasks(fetchedTasks);

        // 初期ロード時に最初のタスクを選択
        if (!currentTaskId && fetchedTasks.length > 0) {
          setCurrentTaskId(fetchedTasks[0].id);
          setStepData(fetchedTasks[0].stepData);
          setCompletedSteps(getCompletedStepsFromData(fetchedTasks[0].stepData));
        } else if (currentTaskId) {
          // 現在選択中のタスクのデータが更新された場合に反映
          const currentTask = fetchedTasks.find(t => t.id === currentTaskId);
          if (currentTask) {
            setStepData(currentTask.stepData);
            setCompletedSteps(getCompletedStepsFromData(currentTask.stepData));
          } else if (fetchedTasks.length > 0) {
            // 現在のタスクが削除された場合、最初のタスクを選択
            setCurrentTaskId(fetchedTasks[0].id);
            setStepData(fetchedTasks[0].stepData);
            setCompletedSteps(getCompletedStepsFromData(fetchedTasks[0].stepData));
          } else {
            // 全てのタスクが削除された場合
            setCurrentTaskId(null);
            setStepData(defaultStepData);
            setCompletedSteps([]);
          }
        }
        console.log("Tasks fetched from Supabase:", fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks from Supabase:", error);
      }
    };

    fetchInitialTasks();
  }, [user.id, isSupabaseLoading, currentTaskId]); // currentTaskId を依存配列に追加

  // stepDataが変更されたときにSupabaseの現在のタスクを更新
  useEffect(() => {
    const updateCurrentTaskInSupabase = async () => {
      if (!user.id || !currentTaskId) {
        return;
      }

      try {
        console.log("Updating current task in Supabase:", stepData, completedSteps);
        const { error } = await supabase
          .from('tasks')
          .update({
            stepData: stepData,
            progress: completedSteps.length,
            // updated_at: date, // SupabaseはISO文字列を推奨
          })
          .eq('id', currentTaskId);

        if (error) throw error;
        console.log("Current task data updated in Supabase:", currentTaskId);
      } catch (error) {
        console.error("Error updating current task in Supabase:", error);
      }
    };

    updateCurrentTaskInSupabase();
  }, [stepData, completedSteps, currentTaskId, user.id]);

  const getCompletedStepsFromData = (data: StepData): number[] => {
    const completed: number[] = []

    // Step 1: Check if there are non-empty ideas
    if (data.step1.some((idea) => idea.trim() !== "")) {
      completed.push(1)
    }

    // Step 2: Check if all fields are filled
    if (data.step2.targetUsers.trim() && data.step2.usageScenarios.trim() && data.step2.benefits.trim()) {
      completed.push(2)
    }

    // Step 3: Check if both fields are filled
    if (data.step3.usageScenes.trim() && data.step3.explanation.trim()) {
      completed.push(3)
    }

    // Step 4: Check if all fields are filled
    if (data.step4.feedback.trim() && data.step4.improvements.trim() && data.step4.finalCheck.trim()) {
      completed.push(4)
    }

    return completed
  }

  const steps = [
    {
      id: 1,
      title: "アイデアの箇条書き",
      description: "企画で出したアイデアを、ざっくり箇条書き",
      icon: FileText,
      color: "from-blue-600 to-blue-700",
    },
    {
      id: 2,
      title: "ユーザー視点で掘り下げ",
      description: "「誰がどう使うか？」を想像しながら掘り下げる",
      icon: Users,
      color: "from-blue-700 to-blue-800",
    },
    {
      id: 3,
      title: "使用シーンの具体化",
      description: "実際に使うシーンを紙に書いてみる or 誰かに説明してみる",
      icon: MessageSquare,
      color: "from-blue-800 to-blue-900",
    },
    {
      id: 4,
      title: "他者視点でチェック",
      description: "「これで伝わるかな？」と他の人の視点でチェックしてみる",
      icon: Eye,
      color: "from-blue-900 to-slate-800",
    },
  ]

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setCurrentTaskId(taskId)
      setStepData(task.stepData)
      setCompletedSteps(getCompletedStepsFromData(task.stepData))
      setCurrentStep(1)
    }
  }

  const handleTaskCreate = async (newTask: Omit<Task, "id" | "created_at" | "updated_at" | "progress">) => {
    if (!user.id) {
      console.error("User ID not available for task creation.");
      return;
    }
    try {
      console.log("Creating new task in Supabase:", newTask);
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...newTask,
          stepData: defaultStepData,
          progress: 0,
          // created_at, updated_at はDBのデフォルト値で自動設定されることを期待
        })
        .select(); // 挿入されたデータを取得

      if (error) throw error;
      console.log("New task created in Supabase:", data[0].id);
      setCurrentTaskId(data[0].id);
      setStepData(defaultStepData);
      setCompletedSteps([]);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error creating new task:", error);
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    if (!user.id) {
      console.error("User ID not available for task deletion.");
      return;
    }
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error;
      console.log("Task deleted from Supabase:", taskId);

      if (currentTaskId === taskId) {
        const remainingTasks = tasks.filter((t) => t.id !== taskId);
        if (remainingTasks.length > 0) {
          handleTaskSelect(remainingTasks[0].id);
        } else {
          setCurrentTaskId(null);
          setStepData(defaultStepData);
          setCompletedSteps([]);
          setCurrentStep(1);
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    if (!user.id) {
      console.error("User ID not available for task update.");
      return;
    }
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(), // SupabaseはISO文字列を推奨
        })
        .eq('id', taskId)

      if (error) throw error;
      console.log("Task updated in Supabase:", taskId);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  const addIdeaItem = () => {
    setStepData((prev) => ({
      ...prev,
      step1: [...prev.step1, ""],
    }))
  }

  const updateIdeaItem = (index: number, value: string) => {
    setStepData((prev) => ({
      ...prev,
      step1: prev.step1.map((item, i) => (i === index ? value : item)),
    }))
  }

  const removeIdeaItem = (index: number) => {
    setStepData((prev) => ({
      ...prev,
      step1: prev.step1.filter((_, i) => i !== index),
    }))
  }

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId])
    }
  }

  const nextStep = () => {
    handleTaskUpdate(currentTaskId!, {
      stepData: stepData,
      completedSteps: [...completedSteps, currentStep],
      progress: (completedSteps.length + 1) / 4 * 100, // 進捗を更新
    })
    markStepComplete(currentStep)
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (completedSteps.length / 4) * 100

  if (isSupabaseLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <Loader2 className="h-10 w-10 animate-spin mr-2" />
        Loading Application...
      </div>
    );
  }

  if (!currentTaskId) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Header user={user} /> {/* userId を Header に渡す */}
        <div className="flex flex-1">
          <Sidebar
            tasks={tasks}
            currentTaskId={currentTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskCreate={handleTaskCreate}
            onTaskDelete={handleTaskDelete}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-24 w-24 text-slate-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">要件定義を始めましょう</h2>
              <p className="text-slate-400 mb-6">左のサイドバーから新しいタスクを作成してください</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header user={user} /> {/* userId を Header に渡す */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          tasks={tasks}
          currentTaskId={currentTaskId}
          onTaskSelect={handleTaskSelect}
          onTaskCreate={handleTaskCreate}
          onTaskDelete={handleTaskDelete}
        />

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-blue-200 font-medium">進捗状況</span>
                <span className="text-blue-200 font-medium">{completedSteps.length}/4 完了</span>
              </div>
              <Progress value={progress} className="h-3 bg-slate-800" />
            </div>

            {/* Step Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {steps.map((step) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = completedSteps.includes(step.id)

                return (
                  <Card
                    key={step.id}
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      isActive
                        ? "border-blue-400 bg-blue-950/50"
                        : isCompleted
                          ? "border-green-400 bg-green-950/30"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${step.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <CardTitle className="text-white text-sm">ステップ {step.id}</CardTitle>
                      <CardDescription className="text-blue-200 text-xs">{step.title}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>

            {/* Current Step Content */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${steps[currentStep - 1].color}`}>
                    {(() => {
                      const Icon = steps[currentStep - 1].icon
                      return <Icon className="h-6 w-6 text-white" />
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">
                      ステップ {currentStep}: {steps[currentStep - 1].title}
                    </CardTitle>
                    <CardDescription className="text-blue-200">{steps[currentStep - 1].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 Content */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white font-medium mb-3 block">アイデアを箇条書きで整理してください</Label>
                      <div className="space-y-3">
                        {stepData.step1.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={item}
                              onChange={(e) => updateIdeaItem(index, e.target.value)}
                              placeholder={`アイデア ${index + 1}`}
                              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            />
                            {stepData.step1.length > 1 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeIdeaItem(index)}
                                className="border-slate-600 text-slate-400 hover:text-white"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={addIdeaItem}
                        variant="outline"
                        className="mt-3 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        + アイデアを追加
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2 Content */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-white font-medium mb-2 block">ターゲットユーザーは誰ですか？</Label>
                      <Textarea
                        value={stepData.step2.targetUsers}
                        onChange={(e) =>
                          setStepData((prev) => ({
                            ...prev,
                            step2: { ...prev.step2, targetUsers: e.target.value },
                          }))
                        }
                        placeholder="例：20-30代のビジネスパーソン、ITに詳しくない人..."
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium mb-2 block">どのような場面で使われますか？</Label>
                      <Textarea
                        value={stepData.step2.usageScenarios}
                        onChange={(e) =>
                          setStepData((prev) => ({
                            ...prev,
                            step2: { ...prev.step2, usageScenarios: e.target.value },
                          }))
                        }
                        placeholder="例：会議前の準備、プロジェクト開始時、アイデア整理時..."
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium mb-2 block">ユーザーにとってのメリットは？</Label>
                      <Textarea
                        value={stepData.step2.benefits}
                        onChange={(e) =>
                          setStepData((prev) => ({
                            ...prev,
                            step2: { ...prev.step2, benefits: e.target.value },
                          }))
                        }
                        placeholder="例：時間短縮、品質向上、ミスの削減..."
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3 Content */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-white font-medium mb-2 block">具体的な使用シーンを描いてください</Label>
                      <Textarea
                        value={stepData.step3.usageScenes}
                        onChange={(e) =>
                          setStepData((prev) => ({
                            ...prev,
                            step3: { ...prev.step3, usageScenes: e.target.value },
                          }))
                        }
                        placeholder="例：田中さんが新プロジェクトの企画書を作成する際に..."
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[120px]"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium mb-2 block">他の人に説明するとしたら？</Label>
                      <Textarea
                        value={stepData.step3.explanation}
                        onChange={(e) =>
                          setStepData((prev) => ({
                            ...prev,
                            step3: { ...prev.step3, explanation: e.target.value },
                          }))
                        }
                        placeholder="このアプリは〇〇な人が〇〇する時に使うもので..."
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[120px]"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4 Content */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-white font-medium mb-2 block">他の人からのフィードバック</Label>
                      <Textarea
                        value={stepData.step4.feedback}
                        onChange={(e) =>
                          setStepData((prev) => ({
                            ...prev,
                            step4: { ...prev.step4, feedback: e.target.value },
                          }))
                        }
                        placeholder="同僚や友人からもらったフィードバックを記録..."
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium mb-2 block">改善点・修正点</Label>
                      <Textarea
                        value={stepData.step4.improvements}
                        onChange={(e) =>
                          setStepData((prev) => ({
                            ...prev,
                            step4: { ...prev.step4, improvements: e.target.value },
                          }))
                        }
                        placeholder="フィードバックを受けて気づいた改善点..."
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium mb-2 block">最終チェック</Label>
                      <Textarea
                        value={stepData.step4.finalCheck}
                        onChange={(e) =>
                          setStepData((prev) => ({
                            ...prev,
                            step4: { ...prev.step4, finalCheck: e.target.value },
                          }))
                        }
                        placeholder="これで要件が明確になったか、伝わりやすいかを確認..."
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="border-slate-600 text-slate-400 hover:text-white disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    前のステップ
                  </Button>

                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    {currentStep === 4 ? "完了" : "次のステップ"}
                    {currentStep !== 4 && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            {completedSteps.length === 4 && (
              <Card className="mt-8 bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    要件定義完了！
                  </CardTitle>
                  <CardDescription className="text-green-200">
                    すべてのステップが完了しました。要件が明確になりましたね！
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">結果をエクスポート</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
