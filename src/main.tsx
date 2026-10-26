import {Component,useEffect,useState,type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,HashRouter,Routes,Route,Navigate} from 'react-router-dom';
import {Layout,Dashboard,Presets,AutomixSettings,Analytics,Profile,HardwareSetup,AudioRouting} from './recovered';
import {CloudPanel} from './CloudPanel';
import './original.css';
import './patches.css';
class ErrorBoundary extends Component<{children:ReactNode},{error:string}>{
 state={error:''};
 static getDerivedStateFromError(e:Error){return {error:e.message};}
 render(){return this.state.error?<main className="sw-panel"><h1>Не удалось открыть приложение</h1><p>{this.state.error}</p><button onClick={()=>location.reload()}>ПЕРЕЗАГРУЗИТЬ</button></main>:this.props.children;}
}
function ErrorNotice(){const [error,setError]=useState('');useEffect(()=>{const listener=(e:PromiseRejectionEvent)=>{setError(e.reason?.message??'Операция не выполнена. Проверьте подключение.');};window.addEventListener('unhandledrejection',listener);return()=>window.removeEventListener('unhandledrejection',listener);},[]);return error?<div className="error-notice" role="alert">{error}<button onClick={()=>setError('')} aria-label="Закрыть ошибку">×</button></div>:null;}
const AppRouter = location.hostname.endsWith('.github.io') ? HashRouter : BrowserRouter;
createRoot(document.getElementById('root')!).render(<ErrorBoundary><AppRouter><CloudPanel/><ErrorNotice/><Routes><Route element={<Layout/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/presets" element={<Presets/>}/><Route path="/automix-settings" element={<AutomixSettings/>}/><Route path="/analytics" element={<Analytics/>}/><Route path="/profile" element={<Profile/>}/><Route path="/hardware-setup" element={<HardwareSetup/>}/><Route path="/audio-routing" element={<AudioRouting/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Route></Routes></AppRouter></ErrorBoundary>);
