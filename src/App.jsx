import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import MainMenu from "./pages/MainMenu";
import HeartBounceGame from "./pages/HeartBounceGame";
import GameModeSelect from "./pages/GameModeSelect";
import ProgressLog from "./pages/ProgressLog";
import Leaderboard from "./pages/Leaderboard";
import PlayerProfile from "./pages/PlayerProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/mainmenu" element={<MainMenu />} />
        <Route path="/game" element={<GameModeSelect />} />
        <Route path="/heart-bounce" element={<HeartBounceGame />} />
        <Route path="/progress-log" element={<ProgressLog />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/player-profile" element={<PlayerProfile />} />
      </Routes>
    </BrowserRouter>
  );
}