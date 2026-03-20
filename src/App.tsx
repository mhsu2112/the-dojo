import { ExamStateProvider, useExamState } from './context/ExamStateContext';
import TopBar from './components/TopBar';
import HomeScreen from './components/HomeScreen';
import Phase1 from './scenarios/Phase1';
import Phase2 from './scenarios/Phase2';
import Phase3 from './scenarios/Phase3';
import Phase4 from './scenarios/Phase4';
import Phase5 from './scenarios/Phase5';

function AppContent() {
  const { state } = useExamState();

  // Show home screen if no API key
  if (!state.apiKey) {
    return <HomeScreen />;
  }

  const renderPhase = () => {
    switch (state.currentPhase) {
      case 1: return <Phase1 />;
      case 2: return <Phase2 />;
      case 3: return <Phase3 />;
      case 4: return <Phase4 />;
      case 5: return <Phase5 />;
      default: return <Phase1 />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f1219] overflow-hidden">
      <TopBar />
      <main className="flex-1 overflow-hidden">
        {renderPhase()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ExamStateProvider>
      <AppContent />
    </ExamStateProvider>
  );
}

export default App;
