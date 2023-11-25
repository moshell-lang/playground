interface ConsoleProps {
  text: string;
}
export const Console = ({ text }: ConsoleProps) => (
  <pre
    className="h-100 fs-6 ms-1"
    dangerouslySetInnerHTML={{ __html: text }}
    id="output"
  />
);
