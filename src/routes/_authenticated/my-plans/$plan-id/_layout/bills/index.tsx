import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/my-plans/$plan-id/_layout/bills/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/my-plans/$plan-id/_layout/bills/"!</div>
}
