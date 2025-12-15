import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md p-4">
        <div className="mb-8 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight">Join Habits Together</h1>
          <p className="mt-2 text-muted-foreground">Create an account to start tracking habits with friends</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
        />
      </div>
    </div>
  )
}
