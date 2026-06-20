import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard/Dashboard";
import ModelList from "@/pages/ModelList/ModelList";
import ModelDetail from "@/pages/ModelDetail/ModelDetail";
import ModelEditor from "@/pages/ModelEditor/ModelEditor";
import StepViewer from "@/pages/StepViewer/StepViewer";
import FoldHistory from "@/pages/FoldHistory/FoldHistory";
import Portfolio from "@/pages/Portfolio/Portfolio";
import PaperInventory from "@/pages/PaperInventory/PaperInventory";
import Statistics from "@/pages/Statistics/Statistics";
import Collections from "@/pages/Collections/Collections";
import CollectionDetail from "@/pages/Collections/CollectionDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/models" element={<ModelList />} />
          <Route path="/models/new" element={<ModelEditor />} />
          <Route path="/models/:id" element={<ModelDetail />} />
          <Route path="/models/:id/edit" element={<ModelEditor />} />
          <Route path="/models/:id/steps" element={<StepViewer />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/folds" element={<FoldHistory />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/paper" element={<PaperInventory />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
