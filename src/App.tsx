import { useEffect, useState } from "react";
import { Trash2 } from 'lucide-react';


type Priority = "Urgente" | "Moyenne" | "Basse";

type Todo = {
  id: number;
  text: string;
  priority: Priority;
  completed: boolean; // <-- Ajout ici
};


const priorityOptions: Priority[] = ["Urgente", "Moyenne", "Basse"];

function App() {
  const [input, setInput] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("Moyenne");

  const savedTodos = localStorage.getItem("todos");

  // 2. On crée une fonction sécurisée pour analyser le JSON
  const getInitialTodos = (): Todo[] => {
    if (!savedTodos) return [];
    try {
      return JSON.parse(savedTodos);
    } catch (e) {
      // Si le localStorage est corrompu, on le nettoie et on démarre à vide sans crasher
      localStorage.removeItem("todos");
      console.log(e)
      return [];
    }
  };

  // 3. On donne la fonction en valeur initiale au useState
  const [todos, setTodos] = useState<Todo[]>(getInitialTodos());
  const [filter, setFilter]= useState<Priority | "Tous" >("Tous")


  useEffect(()=>{
    localStorage.setItem("todos",JSON.stringify(todos))
  },[todos])

  function addTodo(){
    if(!input.trim()){
      return
    }

    const newTodo:Todo ={
      id: Date.now(),
      text: input.trim(),
      priority: priority,
      completed: false
    }

    const newTodos=[newTodo,...todos]
    setTodos(newTodos)
    setInput("")
    setPriority("Moyenne")
  }

  let filteredTodos: Todo[]= []
  if(filter=="Tous"){
    filteredTodos=todos;
  }else if(filter== "Urgente"){
    filteredTodos=todos.filter(todo=>{
      return (todo.priority=="Urgente")
    })
  }else if(filter== "Moyenne"){
    filteredTodos=todos.filter(todo=>{
      return (todo.priority=="Moyenne")
    })
  }else if(filter== "Basse"){
    filteredTodos=todos.filter(todo=>{
      return (todo.priority=="Basse")
    })
  }
  const toggleTodo = (idAModifier: number) => {
  setTodos(prevTodos => 
    prevTodos.map(todo => 
      todo.id === idAModifier ? { ...todo, completed: !todo.completed } : todo
    )
  );
};
  function finirTache(){
    setTodos(todos.filter(todo=>{return(todo.completed==false)}))
  }
  return (
    <div className="flex justify-center p-10">
      <div className="w-2/3 flex flex-col gap-4 bg-base-300 p-5 rounded-2xl">
        <div className="flex gap-4 items-center">
          
          {/* 1. Utilisation de votre nouveau composant Input réutilisable */}
          <Input 
            value={input} 
            onChangeInput={setInput} 
            placeholder="Ajouter une tâche..." 
            onPressEnter={()=>addTodo()}
          />

          <div className="w-1/3">
                <Select lesOptions={priorityOptions} 
                        valueDefault={priority} 
                        onChangeSelect={(val) => setPriority(val as Priority)} />
          </div>

          <button onClick={addTodo} className="btn btn-primary">Ajouter</button>
        </div>
          
        <div className="justify-between flex h-fit ">
          <div className="flex flex-wrap gap-4">
            <button className={`btn btn-soft ${(filter == 'Tous' && "btn-primary")||''}`}
                    onClick={()=>setFilter("Tous")}>
              Tous({todos.length})
            </button>
            <button className={`btn btn-soft ${(filter == 'Basse' && "btn-primary")||''} `}
                    onClick={()=>setFilter("Basse")}>
              Basse({todos.filter(todo=>{return (todo.priority=="Basse")}).length})
            </button>
            <button className={`btn btn-soft ${(filter == 'Moyenne' && "btn-primary")||''}`}
                    onClick={()=>setFilter("Moyenne")}>
              Moyenne({todos.filter(todo=>{return (todo.priority=="Moyenne")}).length})
            </button>
            <button className={`btn btn-soft ${(filter == 'Urgente' && "btn-primary")||''}`}
                    onClick={()=>setFilter("Urgente")}>
              Urgente({todos.filter(todo=>{return (todo.priority=="Urgente")}).length})
            </button>
          </div>
          <button className="btn btn-alert"
                  onClick={()=>finirTache()}>
            finir la selection({todos.filter(todo=>{return (todo.completed==true)}).length})
          </button>
        </div>

        <div>
          <Taches 
            taches={filteredTodos} 
            onDelete={(id: number) => setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))} 
            toggleTodo={toggleTodo}/>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPOSANT INPUT EN TSX
// ==========================================
interface InputProps {
  value: string;
  placeholder?: string;
  onChangeInput: (value: string) => void;
  onPressEnter: () => void; // Changement ici : pas besoin de boolean, on notifie juste l'action
}

function Input({ value, placeholder, onChangeInput, onPressEnter }: InputProps) {
  return (
    <input 
      type="text"
      className="input input-bordered w-full" 
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChangeInput(e.target.value)}
      // Détection de la touche Entrée
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onPressEnter();
        }
      }}
    />
  );
}


// ==========================================
// COMPOSANT SELECT EN TSX
// ==========================================
interface SelectProps {
  lesOptions: string[];
  valueDefault: string;
  onChangeSelect: (value: string) => void; 
}

function Select({ lesOptions, valueDefault, onChangeSelect }: SelectProps) {
  return (
    <select 
      className="select select-bordered w-full" 
      value={valueDefault} 
      onChange={(e) => onChangeSelect(e.target.value)}
    >
      {lesOptions.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

interface InputRadioProps {
  id: number;
  label: string;
  checked: boolean;                  // Savoir si ce bouton est actuellement coché
  onToggle: (id:number)=>void;    // La fonction à appeler lors du changement
}

function InputCheckbox({ id, label, checked, onToggle }: InputRadioProps) {
  return (
    <label htmlFor={`${id}`} className="flex items-center gap-2 cursor-pointer">
      <input 
        type="checkbox"
        id={`${id}`}
        className="radio radio-primary"
        checked={checked}
        // On écoute le changement d'état ici
        onChange={() => (onToggle(id))} 
      />
      {/* On peut ajouter une classe pour barrer le texte si c'est coché */}
      <span className={checked ? "line-through text-gray-500" : ""}>
        {label}
      </span>
    </label>
  );
}


interface TachesProps {
  taches: Todo[];
  onDelete: (id: number) => void; // Contrat : une fonction qui prend l'ID à supprimer
  toggleTodo:(id:number)=>void
}
function Taches({ taches, onDelete, toggleTodo }: TachesProps) {
  // 1. On crée un objet de correspondance pour associer chaque priorité à ses classes Tailwind
  const priorityClasses: Record<Priority, string> = {
    Urgente: "badge-error text-error-content",   // Rouge
    Moyenne: "badge-warning text-warning-content", // Orange
    Basse: "badge-info text-info-content",       // Bleu
  };

  const mesTaches = taches.map(tache => (
    

    <div key={tache.id} className="flex flex-row justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
      <div className="flex items-center gap-3">
        <InputCheckbox label={tache.text} id={tache.id} checked={tache.completed} onToggle={toggleTodo}/>
        
        {/* 2. On applique dynamiquement la classe en fonction de tache.priority */}
        <span className={`badge badge-sm font-semibold ${priorityClasses[tache.priority]}`}>
          {tache.priority}
        </span>
      </div>
      
      <button 
        onClick={() => onDelete(tache.id)}
        className="btn btn-ghost btn-sm text-error hover:bg-error/20 w-auto"
        aria-label="Supprimer la tâche"
      >
        <Trash2 size={18} />
      </button>
    </div>
  ));

  return (
    <div className="p-2">
      {mesTaches.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Aucune tâche pour le moment.</p>
      ) : (
        mesTaches
      )}
    </div>
  );
}





export default App;
