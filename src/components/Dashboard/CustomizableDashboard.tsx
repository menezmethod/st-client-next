import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Paper, ActionIcon, Group, Text, Box, Button, Modal, SimpleGrid } from '@mantine/core';
import { IconPlus, IconTrash, IconChartBar, IconCoin, IconNotes, IconGripVertical } from '@tabler/icons-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import _ from 'lodash';

import { StockWidget } from './widgets/StockWidget';
import { CryptoWidget } from './widgets/CryptoWidget';
import { BondWidget } from './widgets/BondWidget';
import { PerformanceWidget } from './widgets/PerformanceWidget';
import { NotesWidget } from './widgets/NotesWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

const widgetComponents: { [key: string]: React.ComponentType<any> } = {
  stock: StockWidget,
  crypto: CryptoWidget,
  bond: BondWidget,
  performance: PerformanceWidget,
  notes: NotesWidget,
};

const availableWidgets = [
  { id: 'stock', title: 'Stock Overview', icon: IconChartBar, minW: 2, minH: 2, fullWidth: false },
  { id: 'crypto', title: 'Crypto Overview', icon: IconCoin, minW: 2, minH: 2, fullWidth: false },
  { id: 'bond', title: 'Bond Overview', icon: IconChartBar, minW: 2, minH: 2, fullWidth: false },
  { id: 'performance', title: 'Performance Summary', icon: IconChartBar, minW: 3, minH: 2, fullWidth: true },
  { id: 'notes', title: 'Trading Notes', icon: IconNotes, minW: 3, minH: 3, fullWidth: true },
];

interface Widget extends Layout {
  type: string;
}

export function CustomizableDashboard() {
  const [mounted, setMounted] = useState(false);
  const [layouts, setLayouts] = useState<{ [key: string]: Widget[] }>({
    lg: [
      { i: 'widget1', x: 0, y: 0, w: 2, h: 3, type: 'stock' },
      { i: 'widget2', x: 2, y: 0, w: 2, h: 3, type: 'crypto' },
      { i: 'widget3', x: 4, y: 0, w: 2, h: 3, type: 'performance' },
      { i: 'add-widget', x: 0, y: 2, w: 2, h: 3, type: 'add' },
    ]
  });
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

  const [containerWidth, setContainerWidth] = useState(1140);

  useEffect(() => {
    setMounted(true);
    const updateWidth = () => {
      const mainElement = document.querySelector('.mantine-AppShell-main');
      if (mainElement) {
        setContainerWidth(mainElement.clientWidth - 20);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const updateLayout = useCallback((currentLayout: Widget[]) => {
    const contentWidgets = currentLayout.filter(widget => widget.i !== 'add-widget');
    const addWidget = {
      i: 'add-widget',
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      type: 'add'
    };

    contentWidgets.sort((a, b) => a.y - b.y || a.x - b.x);

    let maxY = 0;
    let currentX = 0;
    const updatedContentWidgets = contentWidgets.map((widget) => {
      const updatedWidget = { ...widget, x: currentX, y: maxY };
      currentX += widget.w;
      if (currentX >= 6) {
        currentX = 0;
        maxY += widget.h;
      }
      return updatedWidget;
    });

    if (currentX + addWidget.w <= 6) {
      addWidget.x = currentX;
      addWidget.y = maxY;
    } else {
      addWidget.x = 0;
      addWidget.y = maxY + 2;
    }

    return [...updatedContentWidgets, addWidget];
  }, []);

  const addWidget = useCallback((widgetType: string, isFullWidth: boolean) => {
    setLayouts(prevLayouts => {
      const widgetConfig = availableWidgets.find(w => w.id === widgetType);
      const newWidget: Widget = {
        i: `widget${Date.now()}`,
        x: 0,
        y: Infinity,
        w: isFullWidth ? 6 : 2,
        h: 2,
        type: widgetType,
      };
      
      const newLayoutsLg = [...prevLayouts.lg.filter(w => w.i !== 'add-widget'), newWidget];
      return { ...prevLayouts, lg: updateLayout(newLayoutsLg) };
    });
    setIsAddWidgetModalOpen(false);
  }, [updateLayout]);

  const removeWidget = useCallback((widgetId: string) => {
    setLayouts(prevLayouts => {
      const newLayoutsLg = prevLayouts.lg.filter(widget => widget.i !== widgetId);
      return { ...prevLayouts, lg: updateLayout(newLayoutsLg) };
    });
  }, [updateLayout]);

  const onAddWidgetClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddWidgetModalOpen(true);
  }, []);

  const correctLayout = useCallback((layout: Layout[]): Layout[] => {
    const sortedLayout = _.sortBy(layout, ['y', 'x']);
    const correctedLayout = [];
    let y = 0;

    for (let i = 0; i < sortedLayout.length; i++) {
      const l = sortedLayout[i];
      correctedLayout.push({
        ...l,
        x: (i * 2) % 6,
        y: Math.floor(i / 3) * 2,
        w: Math.min(l.w, 6),
        h: Math.min(l.h, 4),
      });
    }

    return correctedLayout;
  }, []);

  const onLayoutChange = useCallback((layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    const updatedLayout = layout.map(item => {
      const existingItem = layouts.lg.find(w => w.i === item.i);
      return { ...item, type: existingItem?.type || 'unknown' };
    }) as Widget[];

    const sortedLayout = _.sortBy(updatedLayout, ['y', 'x']);

    const swappedLayout = sortedLayout.map((item, index) => ({
      ...item,
      x: (index * 2) % 6,
      y: Math.floor(index / 3) * 2,
    }));

    const contentWidgets = swappedLayout.filter(w => w.i !== 'add-widget');
    const addWidget = swappedLayout.find(w => w.i === 'add-widget');

    if (addWidget) {
      const finalLayout = [...contentWidgets, addWidget];
      setLayouts(prevLayouts => ({ ...prevLayouts, lg: updateLayout(finalLayout) }));
    } else {
      setLayouts(prevLayouts => ({ ...prevLayouts, lg: updateLayout(swappedLayout) }));
    }
  }, [layouts.lg, updateLayout]);

  const renderWidgets = useMemo(() => {
    return layouts.lg.map((widget) => {
      if (widget.i === 'add-widget') {
        return (
          <div key={widget.i}>
            <Paper
              p="md"
              withBorder
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: '#f9f9f9', 
              }}
              onClick={onAddWidgetClick}
            >
              <Text size="xl" fw={700} color="dimmed">Add Widget</Text>
            </Paper>
          </div>
        );
      }

      const WidgetComponent = widgetComponents[widget.type];
      if (!WidgetComponent) {
        console.warn(`Unknown widget type: ${widget.type}`);
        return null;
      }
      return (
        <div key={widget.i}>
          <Paper p="md" withBorder style={{ height: '100%', overflow: 'auto', position: 'relative', background: 'white' }}>
            <Box 
              className="draggable-handle" 
              style={{ 
                cursor: 'move', 
                background: '#f0f0f0',
                padding: '8px 12px', 
                marginBottom: '12px', 
                borderRadius: '4px' 
              }}
            >
              <Text fw={600}>{availableWidgets.find(w => w.id === widget.type)?.title || 'Unknown Widget'}</Text>
            </Box>
            <ActionIcon
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                removeWidget(widget.i);
              }}
              style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}
            >
              <IconTrash size="1rem" />
            </ActionIcon>
            <WidgetComponent />
          </Paper>
        </div>
      );
    });
  }, [layouts.lg, removeWidget, onAddWidgetClick]);

  return (
    <Box style={{ padding: 0 }}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 6, md: 6, sm: 4, xs: 2, xxs: 1 }}
        rowHeight={100}
        width={containerWidth}
        onLayoutChange={onLayoutChange}
        isDraggable
        isResizable
        compactType={null}
        preventCollision={false}
        margin={[10, 10]}
        useCSSTransforms={mounted}
        draggableHandle=".draggable-handle"
      >
        {renderWidgets}
      </ResponsiveGridLayout>
      <Modal
        opened={isAddWidgetModalOpen}
        onClose={() => setIsAddWidgetModalOpen(false)}
        title="Add Widget"
        size="lg"
      >
        <SimpleGrid cols={1} spacing="md">
          {availableWidgets.map((widget) => (
            <Group key={widget.id} justify="space-between">
              <Text>{widget.title}</Text>
              <Group>
                <Button
                  onClick={() => addWidget(widget.id, false)}
                  leftSection={<widget.icon size={14} />}
                  variant="light"
                >
                  Add as Box
                </Button>
                {widget.fullWidth && (
                  <Button
                    onClick={() => addWidget(widget.id, true)}
                    leftSection={<widget.icon size={14} />}
                    variant="light"
                  >
                    Add Full Width
                  </Button>
                )}
              </Group>
            </Group>
          ))}
        </SimpleGrid>
      </Modal>
    </Box>
  );
}