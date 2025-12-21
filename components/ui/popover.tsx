import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as PopoverPrimitive from '@rn-primitives/popover';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';
import { FadeIn, FadeOut } from 'react-native-reanimated';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

const PopoverContent = React.forwardRef<
  PopoverPrimitive.ContentRef,
  PopoverPrimitive.ContentProps & {
    className?: string;
    portalHost?: string;
  }
>(({ className, portalHost, ...props }, ref) => (
  <PopoverPrimitive.Portal hostName={portalHost}>
    <FullWindowOverlay>
      <PopoverPrimitive.Overlay style={Platform.select({ native: StyleSheet.absoluteFill })}>
        <TextClassContext.Provider value="text-popover-foreground">
          <NativeOnlyAnimatedView className="z-50" entering={FadeIn} exiting={FadeOut}>
            <PopoverPrimitive.Content
              ref={ref}
              className={cn(
                'relative z-50 rounded-md border border-border bg-popover shadow-md shadow-black/5',
                Platform.select({
                  web: 'origin-(--radix-popover-content-transform-origin) max-h-52 overflow-y-auto overflow-x-hidden animate-in fade-in-0 zoom-in-95',
                }),
                className
              )}
              {...props}
            />
          </NativeOnlyAnimatedView>
        </TextClassContext.Provider>
      </PopoverPrimitive.Overlay>
    </FullWindowOverlay>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverContent, PopoverTrigger };
