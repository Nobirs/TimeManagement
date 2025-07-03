interface MainContentProps {
    isSidebarOpen: boolean;
    children: React.ReactNode;
}


const MainContent = ({ isSidebarOpen, children }: MainContentProps) => (
    <main className={`flex-1 overflow-hidden p-6 transition-all duration-200 ${
        isSidebarOpen ? 'lg:pl-72' : ''
      }`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
    </main>
);

export default MainContent;