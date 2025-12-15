"use client"

export default function SetupPage() {
  const hasPublishableKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const hasSecretKey = !!process.env.CLERK_SECRET_KEY

  if (hasPublishableKey && hasSecretKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Setup Complete!</h1>
          <p className="mb-6 text-muted-foreground">All environment variables are configured correctly.</p>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
            <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Clerk Setup Required</h1>
          <p className="text-muted-foreground">Missing Clerk environment variables. Please add them to continue.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <code className="text-sm font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>
              {hasPublishableKey ? (
                <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">Found</span>
              ) : (
                <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-500">Missing</span>
              )}
            </div>
            {!hasPublishableKey && (
              <p className="text-xs text-muted-foreground">
                Your value: <code className="font-mono">pk_test_YWNlLWNvdy05OC5jbGVyay5hY2NvdW50cy5kZXYk</code>
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <code className="text-sm font-mono">CLERK_SECRET_KEY</code>
              {hasSecretKey ? (
                <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">Found</span>
              ) : (
                <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-500">Missing</span>
              )}
            </div>
            {!hasSecretKey && (
              <p className="text-xs text-muted-foreground">
                Get this from your Clerk Dashboard (starts with <code className="font-mono">sk_test_</code>)
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <h2 className="font-semibold">How to add environment variables:</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>
                Click on the <strong>Vars</strong> section in the v0 sidebar (left side of your screen)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>Add both environment variables with their values</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>
                Get your <code className="font-mono">CLERK_SECRET_KEY</code> from{" "}
                <a
                  href="https://dashboard.clerk.com/last-active?path=api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Clerk Dashboard
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">4.</span>
              <span>The app will automatically restart with the new variables</span>
            </li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
          >
            Check Again
          </button>
        </div>
      </div>
    </div>
  )
}
