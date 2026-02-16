import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/d/$docId/created/')({
  component: CreatedRedirect,
})

function CreatedRedirect() {
  const { docId } = Route.useParams()
  return <Navigate to="/d/$docId" params={{ docId }} />
}
