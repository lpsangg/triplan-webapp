"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, MessageCircle, Send, UserPlus, Crown } from "lucide-react"

interface Collaborator {
  id: number
  name: string
  email: string
  role: "owner" | "editor" | "viewer"
  avatar?: string
  isOnline: boolean
}

interface Comment {
  id: number
  userId: number
  userName: string
  content: string
  timestamp: string
  activityId?: number
  day?: number
}

interface CollaborativePlanningProps {
  tripId: number
  currentUser: any
}

export default function CollaborativePlanning({ tripId, currentUser }: CollaborativePlanningProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: "owner",
      isOnline: true,
    },
  ])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    // Load collaborative data from localStorage
    const savedCollaborators = localStorage.getItem(`triplan_collaborators_${tripId}`)
    const savedComments = localStorage.getItem(`triplan_comments_${tripId}`)

    if (savedCollaborators) {
      const parsed = JSON.parse(savedCollaborators)
      if (parsed.length > 0) {
        setCollaborators(parsed)
      }
    }
    if (savedComments) setComments(JSON.parse(savedComments))
  }, [tripId])

  const saveCollaborators = (newCollaborators: Collaborator[]) => {
    setCollaborators(newCollaborators)
    localStorage.setItem(`triplan_collaborators_${tripId}`, JSON.stringify(newCollaborators))
  }

  const saveComments = (newComments: Comment[]) => {
    setComments(newComments)
    localStorage.setItem(`triplan_comments_${tripId}`, JSON.stringify(newComments))
  }

  const inviteCollaborator = () => {
    if (!inviteEmail) return

    const newCollaborator: Collaborator = {
      id: Date.now(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "editor",
      isOnline: Math.random() > 0.5,
    }

    saveCollaborators([...collaborators, newCollaborator])
    setInviteEmail("")
  }

  const addComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newComment,
      timestamp: new Date().toISOString(),
      day: selectedDay || undefined,
    }

    saveComments([...comments, comment])
    setNewComment("")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800"
      case "editor":
        return "bg-blue-100 text-blue-800"
      case "viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Collaborators Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Cộng tác viên ({collaborators.length})</span>
              </CardTitle>
              <CardDescription>Mời bạn bè cùng lập kế hoạch chuyến đi</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Mời
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mời cộng tác viên</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Nhập email người bạn muốn mời"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={inviteCollaborator} className="w-full">
                    Gửi lời mời
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{collaborator.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {collaborator.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{collaborator.name}</p>
                    <p className="text-sm text-gray-600">{collaborator.email}</p>
                  </div>
                </div>
                <Badge className={getRoleColor(collaborator.role)}>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(collaborator.role)}
                    <span className="capitalize">{collaborator.role}</span>
                  </div>
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span>Thảo luận nhóm</span>
          </CardTitle>
          <CardDescription>Trao đổi ý kiến về lịch trình với nhóm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-3">
            <Textarea
              placeholder="Chia sẻ ý kiến của bạn về chuyến đi..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Bình luận cho:</span>
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={selectedDay || ""}
                  onChange={(e) => setSelectedDay(e.target.value ? Number.parseInt(e.target.value) : null)}
                >
                  <option value="">Toàn bộ chuyến đi</option>
                  <option value="1">Ngày 1</option>
                  <option value="2">Ngày 2</option>
                  <option value="3">Ngày 3</option>
                </select>
              </div>
              <Button onClick={addComment} size="sm">
                <Send className="h-4 w-4 mr-2" />
                Gửi
              </Button>
            </div>
          </div>

          <Separator />

          {/* Comments List */}
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có bình luận nào</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      {comment.day && (
                        <Badge variant="outline" className="text-xs">
                          Ngày {comment.day}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>
                <strong>{currentUser.name}</strong> đã thêm hoạt động mới
              </span>
              <span className="text-xs">2 phút trước</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span>
                <strong>Minh</strong> đã bình luận về Ngày 2
              </span>
              <span className="text-xs">5 phút trước</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <span>
                <strong>Lan</strong> đã tham gia chuyến đi
              </span>
              <span className="text-xs">1 giờ trước</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
