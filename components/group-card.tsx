import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Users, Target } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface GroupCardProps {
  group: {
    id: string
    name: string
    description: string | null
    image: string | null
    member_count: number
    habit_count: number
    owner_name: string | null
    owner_image: string | null
  }
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="group relative overflow-hidden border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-1 font-semibold group-hover:text-primary">{group.name}</h3>
            {group.description && <p className="line-clamp-2 text-sm text-muted-foreground">{group.description}</p>}
          </div>
          {group.image && (
            <Avatar className="ml-3 h-12 w-12">
              <AvatarImage src={group.image || "/placeholder.svg"} alt={group.name} />
              <AvatarFallback>{group.name[0]}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{group.member_count} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            <span>{group.habit_count} habits</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
