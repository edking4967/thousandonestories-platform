import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import CommunityPage from './pages/CommunityPage'
import SignInPage from './pages/SignInPage'
import StoryPage from './pages/StoryPage'
import SubmitPage from './pages/SubmitPage'
import NewCommunityPage from './pages/NewCommunityPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: '780px', margin: '32px auto 64px', background: '#fff', minHeight: 'calc(100vh - 96px)' }}>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/c/:id" element={<CommunityPage />} />
          <Route path="/c/:communityId/s/:storyId" element={<StoryPage />} />
          <Route path="/c/:id/submit" element={<SubmitPage />} />
          <Route path="/new-community" element={<NewCommunityPage />} />
          <Route path="/c/:id/dashboard" element={<DashboardPage />} />
          <Route path="/signin" element={<SignInPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
