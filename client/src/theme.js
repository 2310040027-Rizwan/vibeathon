import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #0a0e27 0%, #1a1b3a 50%, #0f1123 100%)',
        color: '#e0e7ff',
        minHeight: '100vh',
      },
      '*::selection': {
        bg: 'cyan.400',
        color: 'gray.900',
      },
    },
  },
  colors: {
    neon: {
      cyan: '#00ffff',
      pink: '#ff006e',
      purple: '#7209b7',
      blue: '#4361ee',
      green: '#06ffa5',
      yellow: '#ffbe0b',
    },
    dark: {
      50: '#e7eaf6',
      100: '#c3c9e8',
      200: '#9ca6d9',
      300: '#7483ca',
      400: '#5569be',
      500: '#3550b2',
      600: '#2f49ab',
      700: '#263fa2',
      800: '#1e3699',
      900: '#0f2689',
    },
  },
  fonts: {
    heading: `'Orbitron', 'Inter', sans-serif`,
    body: `'Inter', system-ui, sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
        transition: 'all 0.3s ease',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
        },
      },
      variants: {
        neon: {
          bg: 'transparent',
          border: '2px solid',
          borderColor: 'neon.cyan',
          color: 'neon.cyan',
          textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          _hover: {
            bg: 'neon.cyan',
            color: 'gray.900',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.8), inset 0 0 15px rgba(0, 255, 255, 0.5)',
          },
          _active: {
            transform: 'scale(0.95)',
          },
        },
        neonPink: {
          bg: 'transparent',
          border: '2px solid',
          borderColor: 'neon.pink',
          color: 'neon.pink',
          textShadow: '0 0 10px rgba(255, 0, 110, 0.8)',
          boxShadow: '0 0 10px rgba(255, 0, 110, 0.3)',
          _hover: {
            bg: 'neon.pink',
            color: 'white',
            boxShadow: '0 0 30px rgba(255, 0, 110, 0.8)',
          },
        },
        solid: {
          bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          _hover: {
            bg: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)',
          },
        },
      },
      defaultProps: {
        variant: 'neon',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(26, 27, 58, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'rgba(0, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          _hover: {
            borderColor: 'rgba(0, 255, 255, 0.5)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 255, 255, 0.2)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    Input: {
      variants: {
        neon: {
          field: {
            bg: 'rgba(10, 14, 39, 0.8)',
            border: '2px solid',
            borderColor: 'rgba(0, 255, 255, 0.3)',
            color: 'white',
            _placeholder: { color: 'rgba(224, 231, 255, 0.5)' },
            _hover: {
              borderColor: 'rgba(0, 255, 255, 0.5)',
            },
            _focus: {
              borderColor: 'neon.cyan',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
              bg: 'rgba(10, 14, 39, 0.9)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'neon',
      },
    },
    Textarea: {
      variants: {
        neon: {
          bg: 'rgba(10, 14, 39, 0.8)',
          border: '2px solid',
          borderColor: 'rgba(0, 255, 255, 0.3)',
          color: 'white',
          _placeholder: { color: 'rgba(224, 231, 255, 0.5)' },
          _hover: {
            borderColor: 'rgba(0, 255, 255, 0.5)',
          },
          _focus: {
            borderColor: 'neon.cyan',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
            bg: 'rgba(10, 14, 39, 0.9)',
          },
        },
      },
      defaultProps: {
        variant: 'neon',
      },
    },
    Select: {
      variants: {
        neon: {
          field: {
            bg: 'rgba(10, 14, 39, 0.8)',
            border: '2px solid',
            borderColor: 'rgba(0, 255, 255, 0.3)',
            color: 'white',
            _hover: {
              borderColor: 'rgba(0, 255, 255, 0.5)',
            },
            _focus: {
              borderColor: 'neon.cyan',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'neon',
      },
    },
    Tag: {
      baseStyle: {
        container: {
          bg: 'rgba(0, 255, 255, 0.1)',
          borderRadius: 'full',
          border: '1px solid',
          borderColor: 'neon.cyan',
          color: 'neon.cyan',
          px: 3,
          py: 1,
          fontSize: 'sm',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'Orbitron',
        textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
      },
    },
  },
})

export default theme
