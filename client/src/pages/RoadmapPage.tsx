import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
  createContext,
  type Dispatch,
} from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Connection,
  type Edge,
  Panel,
  MiniMap,
  useReactFlow,
  MarkerType,
  type NodeTypes,
  Handle,
  Position,
  type Node as ReactFlowNode,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import {
  PlusIcon,
  TrashIcon,
  DocumentCheckIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  FolderIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Типы для узлов
type NodeType = "goal" | "step" | "milestone" | "project" | "task";

// Интерфейс для данных узла
interface NodeData {
  label: string;
  completed: boolean;
}

// Интерфейс для узла
interface Node extends ReactFlowNode {
  type: NodeType;
  data: NodeData;
}

// Состояние дорожной карты
interface RoadmapState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  isConnectionMode: boolean;
  sourceNode: string | null;
}

// Действия для reducer
type RoadmapAction =
  | { type: "SET_NODES"; payload: Node[] }
  | { type: "SET_EDGES"; payload: Edge[] }
  | { type: "ADD_NODE"; payload: Node }
  | { type: "DELETE_NODE"; payload: string }
  | { type: "COMPLETE_NODE"; payload: string }
  | { type: "SET_SELECTED_NODE"; payload: string | null }
  | { type: "SET_CONNECTION_MODE"; payload: boolean }
  | { type: "SET_SOURCE_NODE"; payload: string | null }
  | { type: "ADD_EDGE"; payload: Edge }
  | {
      type: "UPDATE_NODE";
      payload: { id: string; data?: Partial<NodeData>; type?: NodeType };
    };

// Контекст дорожной карты
const RoadmapContext = createContext<{
  state: RoadmapState;
  dispatch: Dispatch<RoadmapAction>;
} | null>(null);

// Хук для использования контекста
const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error("useRoadmap must be used within a RoadmapProvider");
  }
  return context;
};

// Reducer для управления состоянием
const roadmapReducer = (
  state: RoadmapState,
  action: RoadmapAction
): RoadmapState => {
  switch (action.type) {
    case "SET_NODES":
      return { ...state, nodes: action.payload };
    case "SET_EDGES":
      return { ...state, edges: action.payload };
    case "ADD_NODE":
      return { ...state, nodes: [...state.nodes, action.payload] };
    case "DELETE_NODE":
      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== action.payload),
        edges: state.edges.filter(
          (edge) =>
            edge.source !== action.payload && edge.target !== action.payload
        ),
      };
    case "COMPLETE_NODE":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload
            ? { ...node, data: { ...node.data, completed: true } }
            : node
        ),
      };
    case "SET_SELECTED_NODE":
      return { ...state, selectedNode: action.payload };
    case "SET_CONNECTION_MODE":
      return { ...state, isConnectionMode: action.payload };
    case "SET_SOURCE_NODE":
      return { ...state, sourceNode: action.payload };
    case "ADD_EDGE":
      return { ...state, edges: [...state.edges, action.payload] };
    case "UPDATE_NODE":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id
            ? {
                ...node,
                data: action.payload.data
                  ? { ...node.data, ...action.payload.data }
                  : node.data,
                type: action.payload.type || node.type,
              }
            : node
        ),
      };
    default:
      return state;
  }
};

// Начальные узлы
const initialNodes: Node[] = [
  {
    id: "1",
    type: "goal",
    data: { label: "Моя цель развития", completed: false },
    position: { x: 250, y: 50 },
  },
];

const initialEdges: Edge[] = [];

// Компонент для маркеров соединений
const NodeHandles = () => (
  <>
    <Handle
      id="1"
      type="target"
      position={Position.Top}
      className="w-3 h-3 bg-blue-500"
    />
    <Handle
      id="10"
      type="source"
      position={Position.Top}
      className="w-3 h-3 bg-blue-500"
    />
    <Handle
      id="2"
      type="target"
      position={Position.Right}
      className="w-3 h-3 bg-blue-500"
    />
    <Handle
      id="20"
      type="source"
      position={Position.Right}
      className="w-3 h-3 bg-blue-500"
    />
    <Handle
      id="3"
      type="target"
      position={Position.Bottom}
      className="w-3 h-3 bg-blue-500"
    />
    <Handle
      id="30"
      type="source"
      position={Position.Bottom}
      className="w-3 h-3 bg-blue-500"
    />
    <Handle
      id="4"
      type="target"
      position={Position.Left}
      className="w-3 h-3 bg-blue-500"
    />
    <Handle
      id="40"
      type="source"
      position={Position.Left}
      className="w-3 h-3 bg-blue-500"
    />
  </>
);

// Кастомный узел
const CustomNode = ({
  id,
  type,
  data,
}: NodeProps<NodeData & { type: NodeType }>) => {
  const [text, setText] = useState(data.label || "");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useRoadmap();

  let baseClasses =
    "px-4 py-3 rounded-xl text-center font-medium shadow-md flex items-center justify-center relative";
  let specificClasses = "";
  let textColor = "text-white";

  switch (type) {
    case "goal":
      specificClasses = "bg-purple-500";
      break;
    case "step":
      specificClasses = "bg-blue-500";
      break;
    case "milestone":
      specificClasses = "bg-yellow-500 rounded-full w-16 h-16";
      textColor = "text-black";
      break;
    case "project":
      specificClasses = "bg-green-500";
      break;
    case "task":
      specificClasses = "bg-gray-500";
      break;
  }

  if (data.completed) {
    specificClasses += " opacity-50";
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    saveChanges();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveChanges();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const saveChanges = () => {
    setIsEditing(false);
    if (text.trim() !== data.label && text !== "") {
      dispatch({
        type: "UPDATE_NODE",
        payload: { id, data: { label: text.trim() } },
      });
    } else {
      setText(data.label);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setText(data.label);
  };

  return (
    <div
      className={`${baseClasses} ${specificClasses} ${textColor} hover:shadow-lg transition-shadow`}
    >
      <NodeHandles />
      {data.completed && (
        <CheckCircleIcon className="absolute top-1 right-1 w-5 h-5 text-green-500" />
      )}
      {isEditing ? (
        <input
          type="text"
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="px-2 py-1 w-full bg-white text-black rounded"
        />
      ) : (
        <div onDoubleClick={handleDoubleClick} className="px-2 py-1">
          {text}
        </div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  goal: CustomNode,
  step: CustomNode,
  milestone: CustomNode,
  project: CustomNode,
  task: CustomNode,
};

// Компонент контекстного меню
const ContextMenu = ({
  nodeId,
  x,
  y,
}: {
  nodeId: string;
  x: number;
  y: number;
}) => {
  const { dispatch } = useRoadmap();

  const handleDelete = () => {
    dispatch({ type: "DELETE_NODE", payload: nodeId });
  };

  const handleComplete = () => {
    dispatch({ type: "COMPLETE_NODE", payload: nodeId });
  };

  const handleAddConnection = () => {
    dispatch({ type: "SET_CONNECTION_MODE", payload: true });
    dispatch({ type: "SET_SOURCE_NODE", payload: nodeId });
  };

  const handleProperties = () => {
    dispatch({ type: "SET_SELECTED_NODE", payload: nodeId });
  };

  return (
    <div
      className="absolute bg-white shadow-lg rounded-md z-10"
      style={{ left: x, top: y }}
    >
      <ul className="py-1 min-w-[160px]">
        <li>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
            onClick={handleDelete}
          >
            <TrashIcon className="w-4 h-4 mr-2 text-red-600" />
            Удалить
          </button>
        </li>
        <li>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
            onClick={handleAddConnection}
          >
            <PlusIcon className="w-4 h-4 mr-2 text-indigo-600" />
            Добавить связь
          </button>
        </li>
        <li>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
            onClick={handleComplete}
          >
            <DocumentCheckIcon className="w-4 h-4 mr-2 text-green-600" />
            Завершить
          </button>
        </li>
        <li>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
            onClick={handleProperties}
          >
            <EllipsisVerticalIcon className="w-4 h-4 mr-2 text-gray-600" />
            Свойства
          </button>
        </li>
      </ul>
    </div>
  );
};

// Компонент боковой панели свойств
const PropertiesSidebar = () => {
  const { state, dispatch } = useRoadmap();
  const node = state.nodes.find((n) => n.id === state.selectedNode);

  if (!node) return null;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: node.id, data: { label: e.target.value } },
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: node.id, type: e.target.value as NodeType },
    });
  };

  return (
    <div className="absolute right-0 top-0 w-64 h-full bg-white shadow-lg p-4">
      <h3 className="font-semibold mb-4">Свойства узла</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Название
        </label>
        <input
          type="text"
          value={node.data.label}
          onChange={handleLabelChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Тип</label>
        <select
          value={node.type}
          onChange={handleTypeChange}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="goal">Цель</option>
          <option value="step">Шаг</option>
          <option value="milestone">Веха</option>
          <option value="project">Проект</option>
          <option value="task">Задача</option>
        </select>
      </div>
      <button
        onClick={() => dispatch({ type: "SET_SELECTED_NODE", payload: null })}
        className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
      >
        Закрыть
      </button>
    </div>
  );
};

// Основной компонент страницы
const RoadmapPage: React.FC = () => {
  const [state, dispatch] = React.useReducer(roadmapReducer, {
    nodes: initialNodes,
    edges: initialEdges,
    selectedNode: null,
    isConnectionMode: false,
    sourceNode: null,
  });
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType>("step");
  const [roadmapName, setRoadmapName] = useState("Мой план развития");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      dispatch({
        type: "ADD_EDGE",
        payload: {
          id: uuidv4(),
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle || null,
          targetHandle: params.targetHandle || null,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
        },
      });
    }
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;
      if (
        !type ||
        !["goal", "step", "milestone", "project", "task"].includes(type)
      )
        return;
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: {
          label: newNodeLabel || `Новый ${getNodeTypeLabel(type)}`,
          completed: false,
        },
      };
      dispatch({ type: "ADD_NODE", payload: newNode });
      setNewNodeLabel("");
    },
    [project, newNodeLabel]
  );

  const addNewNode = () => {
    if (!newNodeLabel.trim()) return;
    const newNode = {
      id: uuidv4(),
      type: selectedNodeType,
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: newNodeLabel, completed: false },
    };
    dispatch({ type: "ADD_NODE", payload: newNode });
    setNewNodeLabel("");
  };

  const deleteSelected = () => {
    const selectedNodes = state.nodes.filter((node) => node.selected);
    selectedNodes.forEach((node) =>
      dispatch({ type: "DELETE_NODE", payload: node.id })
    );
    setContextMenu(null);
  };

  const saveRoadmap = () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem("savedRoadmap", JSON.stringify(flow));
      localStorage.setItem("roadmapName", roadmapName);
      alert("Дорожная карта сохранена!");
    }
  };

  const loadRoadmap = () => {
    const savedFlow = localStorage.getItem("savedRoadmap");
    const savedName = localStorage.getItem("roadmapName");
    if (savedFlow) {
      const flow = JSON.parse(savedFlow);
      dispatch({ type: "SET_NODES", payload: flow.nodes || [] });
      dispatch({ type: "SET_EDGES", payload: flow.edges || [] });
      if (savedName) setRoadmapName(savedName);
    }
  };

  const exportRoadmap = () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(flow));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `${roadmapName}.roadmap.json`
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  const importRoadmap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flow = JSON.parse(e.target?.result as string);
        dispatch({ type: "SET_NODES", payload: flow.nodes || [] });
        dispatch({ type: "SET_EDGES", payload: flow.edges || [] });
      } catch (error) {
        console.error("Ошибка загрузки файла:", error);
        alert("Неверный формат файла дорожной карты");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const getNodeTypeLabel = (type: NodeType) => {
    switch (type) {
      case "goal":
        return "цель";
      case "step":
        return "шаг";
      case "milestone":
        return "веха";
      case "project":
        return "проект";
      case "task":
        return "задача";
      default:
        return "элемент";
    }
  };

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: ReactFlowNode<NodeData>) => {
      event.preventDefault();
      if (reactFlowWrapper.current) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        setContextMenu({
          nodeId: node.id,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
      }
    },
    []
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: ReactFlowNode<NodeData>) => {
      if (
        state.isConnectionMode &&
        state.sourceNode &&
        state.sourceNode !== node.id
      ) {
        const newEdge = {
          id: uuidv4(),
          source: state.sourceNode,
          target: node.id,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
        };
        dispatch({ type: "ADD_EDGE", payload: newEdge });
        dispatch({ type: "SET_CONNECTION_MODE", payload: false });
        dispatch({ type: "SET_SOURCE_NODE", payload: null });
      }
    },
    [state.isConnectionMode, state.sourceNode]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        event.target instanceof globalThis.Node &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state.isConnectionMode) {
        dispatch({ type: "SET_CONNECTION_MODE", payload: false });
        dispatch({ type: "SET_SOURCE_NODE", payload: null });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.isConnectionMode]);

  return (
    <RoadmapContext.Provider value={{ state, dispatch }}>
      <div className="container mx-auto px-2 py-2">
        <div className="bg-gray-800 text-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <input
              type="text"
              value={roadmapName}
              onChange={(e) => setRoadmapName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-b border-white/30 focus:border-white focus:outline-none py-1 w-full max-w-2xl"
            />
            <div className="flex space-x-2">
              <button
                onClick={saveRoadmap}
                className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
              >
                <DocumentCheckIcon className="w-5 h-5 mr-1" /> Сохранить
              </button>
              <button
                onClick={loadRoadmap}
                className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
              >
                <FolderIcon className="w-5 h-5 mr-1" /> Загрузить
              </button>
              <button
                onClick={exportRoadmap}
                className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-1" /> Экспорт
              </button>
              <label className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                <ArrowUpTrayIcon className="w-5 h-5 mr-1" /> Импорт
                <input
                  type="file"
                  accept=".json"
                  onChange={importRoadmap}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-gray-100 border-r border-gray-200 p-4 flex flex-col">
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Элементы дорожной карты</h3>
              <p className="text-sm text-gray-600 mb-3">
                Перетащите элементы на холст
              </p>
              <div className="space-y-2">
                {(
                  ["goal", "step", "milestone", "project", "task"] as NodeType[]
                ).map((type) => (
                  <div
                    key={type}
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData("application/reactflow", type)
                    }
                    className={`p-3 rounded-lg border cursor-move transition-all hover:shadow-md ${
                      selectedNodeType === type
                        ? "bg-blue-100 border-blue-400"
                        : "bg-white border-gray-300"
                    }`}
                    onClick={() => setSelectedNodeType(type)}
                  >
                    <div className="text-center font-medium text-sm">
                      {getNodeTypeLabel(type).toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <h3 className="font-semibold mb-2">Добавить элемент</h3>
              <select
                value={selectedNodeType}
                onChange={(e) =>
                  setSelectedNodeType(e.target.value as NodeType)
                }
                className="w-full p-2 border border-gray-300 rounded mb-3"
              >
                <option value="goal">Цель</option>
                <option value="step">Шаг</option>
                <option value="milestone">Веха</option>
                <option value="project">Проект</option>
                <option value="task">Задача</option>
              </select>
              <input
                type="text"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder={`Название ${getNodeTypeLabel(selectedNodeType)}`}
                className="w-full p-2 border border-gray-300 rounded mb-3"
              />
              <button
                onClick={addNewNode}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <PlusIcon className="w-4 h-4 mr-1" /> Добавить
              </button>
              <button
                onClick={deleteSelected}
                className="w-full mt-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                <TrashIcon className="w-4 h-4 mr-1" /> Удалить выбранное
              </button>
            </div>
          </div>

          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={state.nodes}
              edges={state.edges}
              onNodesChange={(changes) => {
                const updatedNodes = changes.reduce<Node[]>((acc, change) => {
                  if (
                    change.type === "dimensions" ||
                    change.type === "position"
                  ) {
                    return acc.map((node) =>
                      node.id === change.id
                        ? {
                            ...node,
                            position:
                              change.type === "position" &&
                              "position" in change &&
                              change.position
                                ? change.position
                                : node.position,
                            width:
                              change.type === "dimensions" &&
                              "dimensions" in change &&
                              change.dimensions?.width
                                ? change.dimensions.width
                                : node.width || undefined,
                            height:
                              change.type === "dimensions" &&
                              "dimensions" in change &&
                              change.dimensions?.height
                                ? change.dimensions.height
                                : node.height || undefined,
                          }
                        : node
                    );
                  }
                  return acc;
                }, state.nodes);
                dispatch({ type: "SET_NODES", payload: updatedNodes });
              }}
              onEdgesChange={(changes) => {
                const updatedEdges = changes.reduce<Edge[]>((acc, change) => {
                  if (change.type === "select" && "selected" in change) {
                    return acc.map((edge) =>
                      edge.id === change.id
                        ? { ...edge, selected: change.selected }
                        : edge
                    );
                  }
                  return acc;
                }, state.edges);
                dispatch({ type: "SET_EDGES", payload: updatedEdges });
              }}
              onConnect={onConnect}
              onInit={setRfInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              onNodeContextMenu={onNodeContextMenu}
              onNodeClick={onNodeClick}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background color="#aaa" gap={16} />
              <Panel
                position="top-right"
                className="bg-white/80 rounded-lg shadow-sm p-2 text-sm mb-2"
              >
                Перетаскивайте элементы из панели слева. Соединяйте элементы
                перетаскиванием от маркера одного узла к другому.
              </Panel>
            </ReactFlow>
            {contextMenu && (
              <ContextMenu
                nodeId={contextMenu.nodeId}
                x={contextMenu.x}
                y={contextMenu.y}
              />
            )}
            {state.selectedNode && <PropertiesSidebar />}
          </div>
        </div>
      </div>
    </RoadmapContext.Provider>
  );
};

// Обертка для провайдера
const RoadmapPageWrapper: React.FC = () => {
  return (
    <ReactFlowProvider>
      <RoadmapPage />
    </ReactFlowProvider>
  );
};

export default RoadmapPageWrapper;
