import { useState, useMemo } from 'react';
import Head from 'next/head';
import {
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Tabs,
  Burger,
  rem,
  useMantineTheme,
} from '@mantine/core';
import {
  IconLogout,
  IconSettings,
  IconSwitchHorizontal,
  IconChevronDown,
  IconNotes,
  IconChartBar,
  IconRobot,
  IconEye,
  IconReportMoney,
} from '@tabler/icons-react';
import classes from './HeaderTabs.module.css';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { useUser } from '@/lib/auth';

// Add this function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Add this function to get initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

const tabs = [
  { value: 'dashboard', label: 'Dashboard', icon: IconChartBar },
  { value: 'journals', label: 'Journals', icon: IconNotes },
  { value: 'records', label: 'Records', icon: IconChartBar },
  { value: 'ai-analysis', label: 'AI Analysis', icon: IconRobot },
  { value: 'watch-list', label: 'Watch List', icon: IconEye },
  { value: 'reports', label: 'Reports', icon: IconReportMoney },
];

const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60" width="150" height="30" style={{ filter: 'grayscale(100%) brightness(0.7)' }}>
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#333333', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#666666', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <text x="10" y="45" fontFamily="Poppins, sans-serif" fontSize="40" fontWeight="bold" fill="url(#grad1)">ST</text>
    <text x="80" y="45" fontFamily="Poppins, sans-serif" fontSize="40" fontWeight="bold" fill="#333333">TRADER</text>
    <polyline points="220,30 240,15 260,25 280,10" stroke="#666666" strokeWidth="3" fill="none" />
    <polygon points="280,10 290,20 270,20" fill="#666666" />
  </svg>
);

export function HeaderTabs({ opened, toggle }: { opened: boolean; toggle: () => void }) {
  const theme = useMantineTheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const router = useRouter();
  const { data: user, isLoading } = useUser();

  // Generate a random background color for the avatar
  const avatarColor = useMemo(() => getRandomColor(), []);

  const items = tabs.map((tab) => (
    <Tabs.Tab value={tab.value} key={tab.value} leftSection={<tab.icon size="0.8rem" />}>
      {tab.label}
    </Tabs.Tab>
  ));

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div className={classes.header}>
        <Container className={classes.mainSection} size="md">
          <Group justify="space-between">
            <Logo />

            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

            {!isLoading && user && (
              <Menu
                width={260}
                position="bottom-end"
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
                withinPortal
              >
                <Menu.Target>
                  <UnstyledButton className={classes.user}>
                    <Group gap={7}>
                      <Avatar 
                        src={user.photoURL} 
                        alt={user.displayName || ''} 
                        radius="xl" 
                        size={20}
                        color={avatarColor}
                      >
                        {user.displayName ? getInitials(user.displayName) : ''}
                      </Avatar>
                      <Text fw={500} size="sm" lh={1} mr={3}>
                        {user.displayName || user.email}
                      </Text>
                      <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={
                      <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                  >
                    Account settings
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconSwitchHorizontal style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                  >
                    Change account
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Container>
        <Container size="md">
          <Tabs
            defaultValue="dashboard"
            variant="outline"
            visibleFrom="sm"
            classNames={{
              root: classes.tabs,
              list: classes.tabsList,
              tab: classes.tab,
            }}
          >
            <Tabs.List>{items}</Tabs.List>
          </Tabs>
        </Container>
      </div>
    </>
  );
}