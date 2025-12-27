import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/my-plans/$plan-id/_layout/members/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/my-plans/$plan-id/_layout/members/"!</div>
}
