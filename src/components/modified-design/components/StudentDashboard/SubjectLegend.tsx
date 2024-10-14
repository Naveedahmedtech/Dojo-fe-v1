import { VictoryLegend, VictoryLabel } from 'victory';

const SubjectLegend = ({ legendData, colorScale, handleLegendClick }: any) => {
    return (
        <VictoryLegend
            x={0}
            y={300}
            orientation="horizontal"
            gutter={20}
            data={legendData}
            colorScale={colorScale}
            style={{
                labels: { fontSize: 16, padding: 10 },
                parent: {
                    position: "absolute",
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '300px',
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fit, minmax(${Math.max(150, 300 / legendData.length)}px, 1fr))`,
                    gap: '10px',
                    cursor: 'pointer'
                }
            }}
            labelComponent={<VictoryLabel dy={0} />}
            rowGutter={{ top: 10, bottom: 10 }}
            width={400}
            height={280}
            events={[{
                target: 'labels',
                eventHandlers: {
                    onClick: (_event: any, props: { datum: any; }) => {
                        const { datum } = props;
                        if (datum && datum.name) {
                            handleLegendClick(datum.name);
                        }
                    }
                }
            }]}
        />
    );
};

export default SubjectLegend;
