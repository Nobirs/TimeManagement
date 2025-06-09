import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Connection,
    Edge,
    Panel,
    MiniMap,
    useReactFlow,
    MarkerType,
    NodeTypes,
    Handle,
    Position
} from 'reactflow';
import type { Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from "uuid";
import {
    PlusIcon,
    TrashIcon,
    DocumentCheckIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    FolderIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

// Типы для узлов
type NodeType = 'goal' | 'step' | 'milestone' | 'project' | 'task';

// Кастомные узлы с Handle для соединений
const CustomNode = ({ type, label }: { type: NodeType, label: string }) => {
    const baseClasses = "px-4 py-3 rounded-xl text-center font-medium shadow-md flex items-center justify-center relative";
    let specificClasses = "";

    switch (type) {
        case 'goal':
            specificClasses = "bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold border-2 border-white min-w-[200px]";
            break;
        case 'step':
            specificClasses = "bg-white border-2 border-blue-500 text-blue-800";
            break;
        case 'milestone':
            specificClasses = "bg-yellow-400 border-4 border-yellow-300 text-gray-900 font-bold rounded-full w-16 h-16";
            break;
        case 'project':
            specificClasses = "bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold border-2 border-white";
            break;
        case 'task':
            specificClasses = "bg-gray-100 border border-gray-300 text-gray-700 rounded-md px-3 py-2";
            break;
    }

    return (
        <div className={`${baseClasses} ${specificClasses}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
            <div className="px-2 py-1">{label}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
        </div>
    );
};

const nodeTypes: NodeTypes = {
    goal: ({ data }: any) => <CustomNode type="goal" label={data.label} />,
    step: ({ data }: any) => <CustomNode type="step" label={data.label} />,
    milestone: ({ data }: any) => <CustomNode type="milestone" label={data.label} />,
    project: ({ data }: any) => <CustomNode type="project" label={data.label} />,
    task: ({ data }: any) => <CustomNode type="task" label={data.label} />,
};

// Начальные узлы
const initialNodes: Node[] = [
    {
        id: '1',
        type: 'goal',
        data: { label: 'Моя цель развития' },
        position: { x: 250, y: 50 },
    },
];

const initialEdges: Edge[] = [];

const RoadmapPage: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [newNodeLabel, setNewNodeLabel] = useState('');
    const [selectedNodeType, setSelectedNodeType] = useState<NodeType>('step');
    const [roadmapName, setRoadmapName] = useState('Мой план развития');
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { project } = useReactFlow();
    const [rfInstance, setRfInstance] = useState<any>(null);
    const [contextMenu, setContextMenu] = useState<{
        nodeId: string | null;
        x: number;
        y: number;
    } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(
            { ...params, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } },
            eds
        )),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current) return;

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow') as NodeType;

            // Проверяем, что перетаскиваемый элемент является допустимым
            if (!type || !['goal', 'step', 'milestone', 'project', 'task'].includes(type)) {
                return;
            }

            const position = project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode = {
                id: uuidv4(),
                type,
                position,
                data: { label: newNodeLabel || `Новый ${getNodeTypeLabel(type)}` },
            };

            setNodes((nds) => nds.concat(newNode));
            setNewNodeLabel('');
        },
        [project, newNodeLabel, setNodes]
    );

    const addNewNode = () => {
        if (!newNodeLabel.trim()) return;

        const newNode = {
            id: uuidv4(),
            type: selectedNodeType,
            position: { x: Math.random() * 500, y: Math.random() * 500 },
            data: { label: newNodeLabel },
        };

        setNodes((nds) => nds.concat(newNode));
        setNewNodeLabel('');
    };

    const deleteSelected = () => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
        setContextMenu(null);
    };

    const deleteNode = (nodeId: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
        setContextMenu(null);
    };

    const saveRoadmap = () => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            localStorage.setItem('savedRoadmap', JSON.stringify(flow));
            localStorage.setItem('roadmapName', roadmapName);
            alert('Дорожная карта сохранена!');
        }
    };

    const loadRoadmap = () => {
        const savedFlow = localStorage.getItem('savedRoadmap');
        const savedName = localStorage.getItem('roadmapName');

        if (savedFlow) {
            const flow = JSON.parse(savedFlow);
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);

            if (savedName) {
                setRoadmapName(savedName);
            }
        }
    };

    const exportRoadmap = () => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `${roadmapName}.roadmap.json`);
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
                setNodes(flow.nodes || []);
                setEdges(flow.edges || []);
            } catch (error) {
                console.error('Ошибка загрузки файла:', error);
                alert('Неверный формат файла дорожной карты');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Сброс input
    };

    const getNodeTypeLabel = (type: NodeType) => {
        switch (type) {
            case 'goal': return 'цель';
            case 'step': return 'шаг';
            case 'milestone': return 'веха';
            case 'project': return 'проект';
            case 'task': return 'задача';
            default: return 'элемент';
        }
    };

    // Обработчик контекстного меню
    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
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

    // Закрытие контекстного меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && event.target instanceof Node &&
                !contextMenuRef.current.contains(event.target)) {
                setContextMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="container mx-auto px-2 py-2">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 shadow-md">
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
                            className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
                            title="Сохранить"
                        >
                            <DocumentCheckIcon className="w-5 h-5 mr-1" /> Сохранить
                        </button>
                        <button
                            onClick={loadRoadmap}
                            className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
                            title="Загрузить"
                        >
                            <FolderIcon className="w-5 h-5 mr-1" /> Загрузить
                        </button>
                        <button
                            onClick={exportRoadmap}
                            className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
                            title="Экспорт"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5 mr-1" /> Экспорт
                        </button>
                        <label className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors cursor-pointer">
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
                {/* Панель инструментов */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Элементы дорожной карты</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Перетащите элементы на холст
                        </p>

                        <div className="space-y-2">
                            {(['goal', 'step', 'milestone', 'project', 'task'] as NodeType[]).map((type) => (
                                <div
                                    key={type}
                                    draggable
                                    onDragStart={(event) => event.dataTransfer.setData('application/reactflow', type)}
                                    className={`p-3 rounded-lg border cursor-move transition-all hover:shadow-md ${
                                        selectedNodeType === type
                                            ? 'bg-indigo-100 border-indigo-400'
                                            : 'bg-white border-gray-300'
                                    }`}
                                    onClick={() => setSelectedNodeType(type)}
                                >
                                    <div className={`
                    text-center font-medium text-sm
                    ${type === 'goal' ? 'text-purple-800' : ''}
                    ${type === 'step' ? 'text-blue-800' : ''}
                    ${type === 'milestone' ? 'text-yellow-800' : ''}
                    ${type === 'project' ? 'text-green-800' : ''}
                    ${type === 'task' ? 'text-gray-800' : ''}
                  `}>
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
                            onChange={(e) => setSelectedNodeType(e.target.value as NodeType)}
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
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
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

                {/* Область рисования */}
                <div className="flex-1 relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setRfInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        onNodeContextMenu={onNodeContextMenu}
                        fitView
                    >
                        <Controls />
                        <MiniMap />
                        <Background color="#aaa" gap={16} />

                        <Panel position="top-right" className="bg-white/80 rounded-lg shadow-sm p-2 text-sm mb-2">
                            Перетаскивайте элементы из панели слева. Соединяйте элементы перетаскиванием от маркера одного узла к другому.
                        </Panel>
                    </ReactFlow>

                    {/* Контекстное меню */}
                    {contextMenu && (
                        <div
                            ref={contextMenuRef}
                            className="absolute bg-white shadow-lg rounded-md z-10"
                            style={{ left: contextMenu.x, top: contextMenu.y }}
                        >
                            <ul className="py-1 min-w-[160px]">
                                <li>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                                        onClick={() => contextMenu.nodeId && deleteNode(contextMenu.nodeId)}
                                    >
                                        <TrashIcon className="w-4 h-4 mr-2 text-red-600" />
                                        Удалить
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                                        onClick={() => setContextMenu(null)}
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2 text-indigo-600" />
                                        Добавить связь
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                                        onClick={() => setContextMenu(null)}
                                    >
                                        <DocumentCheckIcon className="w-4 h-4 mr-2 text-green-600" />
                                        Завершить
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                                        onClick={() => setContextMenu(null)}
                                    >
                                        <EllipsisVerticalIcon className="w-4 h-4 mr-2 text-gray-600" />
                                        Свойства
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
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